---
title: MakeMySheet Part 3 - SWE and Design Patterns
published_at: 2025-02-10T16:00:00.000Z
read_time: 9
prev_post: content/posts/MakeMySheet-Design-Doc.md
next_post: content/posts/MakeMySheet-Part-4---Testing-and-QA.md
excerpt: Software Engineering and Design Patterns
---

> [MakeMySheet](https://makemysheet.com) is an AI music transcriber tool that converts music audio into music sheet. MakeMySheet is a project I created with [Shi Xin](https://github.com/apollo-tan) for NUS Orbital at the Artemis level. The contents here were taken from our [ReadMe](https://drive.google.com/file/d/1MSCzP2GQiQ_NtrvwtkeRR3pjgD7xxjvQ/view), with some portions cut off to reduce redundancy. This post is part of a series of posts where I break down the technical decisions behind MakeMySheet.

# Software Design Patterns

## Singleton

We used the Singleton pattern for core services to ensure a single instance per service throughout the app’s lifecycle.

* AlertService: A singleton with a static alert method that triggers ReactToast, ensuring a consistent alert mechanism.
* PromptConfirmModal: Uses a hook and centralised Redux state to manage visibility and data for prompt modals.
* AuthClient: Manages authentication with singleton instances for login and logout.

By centralising these services, we reduce redundancy, simplify state management, and ensure consistent behaviour across the app, improving maintainability and scalability.

## Database Per Service

Each microservice has its own database, ensuring loose coupling and encapsulating data storage details within each service.

* Backend: Manages `Conversion` and `RegisteredTelegramUser` tables.
* Auth0: Handles `User` and `Tenant` tables.

A key challenge in microservices is maintaining data consistency and handling distributed transactions. Proper API contracts mitigate this by preventing cascading changes across services.

For example, without a well-defined contract, a change in file conversion output requirements would require updates across the frontend, backend, ML service, and possibly a database migration. To avoid this, we designed the result output as a list of items with a consistent schema (below is just an example):

```json
[{ "fileUrl": "string", "type": "string" }]
```

This abstraction allows each service to handle varying data outputs without structural changes, ensuring modularity and extensibility.

## Work Queue

We used a work queue to distribute tasks efficiently across ML service containers. These replicas listen to the job queue and assign tasks using a round-robin algorithm, ensuring fair distribution.

![](/images/blog/makemysheet/image61.png)

Benefits

* Scalability: The number of worker nodes can dynamically adjust based on workload.
* Load Balancing: Tasks are evenly distributed, preventing any single node from being overwhelmed.

This approach allows us to scale processing capabilities seamlessly while maintaining system efficiency.

## Publisher-Subscriber (Pub/Sub)

Before adopting the Worker Queue pattern, we initially implemented Pub/Sub.

### How Pub/Sub Worked

In this pattern, publishers send messages to a topic exchange rather than specific receivers. We used two routing keys:

* "job" – Signals new tasks for processing.
* "result" – Broadcasts completed conversions.

### Why Pub/Sub?

This approach decouples publishers and subscribers, enabling a scalable, event-driven system.

* Asynchronous Processing: ML tasks, especially for large audio files, can take time. Services don’t need to wait for each other.
* Flexibility: Publishers and subscribers operate independently, making it easy to add new consumers without modifying existing services.

### Implementation

![](/images/blog/makemysheet/image6.png)

We used RabbitMQ to handle message routing, ensuring efficient communication between services. While we later replaced this with the Worker Queue model for more controlled task distribution, Pub/Sub played a crucial role in handling long-running ML tasks in our early milestones.

## Strategy Pattern

The GenericBackendClient class abstracts API interactions using the Strategy pattern, encapsulating different request-handling approaches.

### Key Methods

* getAll – Retrieves multiple records.
* get – Fetches a single resource.
* delete – Removes an item.
* edit – Updates existing data.

Each method represents a distinct strategy for API communication, promoting code reusability, flexibility, and maintainability by decoupling request logic from implementation details.

## Facade Pattern

In our backend service, we structured data handling and business logic into distinct layers for better separation of concerns. We structured our backend into multiple layers for separation of concerns, ensuring modularity and maintainability.

![](/images/blog/makemysheet/image4.png)

### Clients (Frontend / Other Services)

Clients interact with the backend via HTTP or RPC, making requests to access or modify data. These could be:

* Frontend applications – Web and Telegram clients
* Other microservices – Communicating via internal APIs or message queues.

### Controller Layer

* Handles incoming requests and delegates logic to the Service Layer.
* Validates input and returns appropriate responses.
* Keeps business logic out of controllers to maintain clarity and simplicity.

### Service Layer

The Service Layer acts as an intermediary between the Controller and ORM layers, providing:

* A unified API – Controllers interact with services instead of directly handling business logic.
* Encapsulation – Hides ORM complexities from the Controller layer.
* Reusability – Business logic is centralized, reducing duplication across controllers.

This design keeps the controllers lightweight, improves maintainability, and simplifies future modifications.

### ORM Layer

* Interfaces with the database, abstracting raw SQL queries.
* Maps database tables to objects/models, allowing easy CRUD operations.
* Ensures database-agnostic operations, enabling easier migrations or backend changes.

### Database

* Stores persistent data for the application.
* Ensures ACID compliance and data integrity through transactions.
* Indexed and optimized for efficient querying by the ORM layer.

This layered architecture enhances scalability, testability, and maintainability, making it easier to manage complex backend operation

# Software Engineering Principles

## Single Responsibility Principle

SRP, one of the SOLID principles, states that a class or module should have only one reason to change—meaning it should handle a single responsibility. While originally an object-oriented design principle, SRP is highly relevant in microservices architecture as well.

### Applying SRP to Microservices

Each microservice is designed to focus on a specific business capability, ensuring loose coupling and high cohesion. This makes services easier to manage, deploy, and scale independently.

#### Service Responsibilities

* ml\_service – Listens to the queue, processes tasks, and publishes results.
* backend – Handles authenticated CRUD for conversions but excludes file conversion logic.
* Auth0 – Manages authentication and authorization.
* web\_frontend – The browser-based user interface.
* telegram – The Telegram bot interface.

By enforcing SRP at the service level, we ensure a modular, scalable, and maintainable system where each service has a well-defined purpose.

## Object-Oriented Programming (OOP)

Although most of our code follows a functional programming paradigm, we selectively use OOP where it provides clear benefits. One example is the ApiClient class in our frontend project, which enhances API interactions through inheritance, encapsulation, abstraction, and polymorphism.

### OOP Principles in ApiClient

* Inheritance – GenericBackendClient extends ApiClient, inheriting properties like token and shared API methods.
* Encapsulation – The token property is protected, restricting direct access from external code while allowing controlled access within subclasses.
* Abstraction – ApiClient defines a general API structure, while GenericBackendClient provides a specific implementation. The ApiModel interface abstracts API responses, enforcing a consistent format.
* Polymorphism – While not through method overriding, polymorphism is applied through the ApiModel interface, ensuring different API responses follow the same structure.

### Why This Matters

This design significantly reduces runtime errors. Before processing a response, we can type-check if it's an error or success. If it's a success, we are guaranteed valid data, improving code reliability. Additionally, GenericBackendClient makes it easy to extend API functionality by subclassing, allowing for clean and maintainable API request handling.

## Graceful Failure Handling across microservices

![](/images/blog/makemysheet/image12.png)

### Fault Tolerance

Failures can occur in any microservice, so we employ multiple fault tolerance mechanisms:

* Automatic Service Restarts – Each service is configured in Docker Compose to restart upon failure, ensuring minimal downtime.
* RabbitMQ Durability – Queues are declared as durable, meaning messages persist until explicitly acknowledged. If a node fails, the message is requeued and processed by another node, preventing data loss.

### Error Handling

* REST API Errors – Standard try-catch blocks handle errors based on HTTP responses.
* Message Queue Errors – A dedicated error queue captures recoverable failures like runtime or validation errors.
* External Failures (e.g., Docker Crashes) – Since some failures cannot be caught programmatically, we rely on message acknowledgements and durable queues to prevent message loss.

By combining fault tolerance mechanisms and structured error handling, we ensure a resilient and self-recovering system.

## Development Strategies

The two main development strategies we adopted were test-driven development and iterative development. Both have its merits, and we found ourselves using a balance of both in areas where we deem fit.

### Test-Driven Development

In software engineering, test-driven development (TDD) is a technique where test cases are formulated, and clear expectations of the end result are established before coding begins. TDD is recognized as one of the most important strategies in software development, offering major benefits such as higher code quality, a faster feedback loop, and improved regression safety.\
\
This ensures code integrity, and allows developers to be more confident of the changes they have made, and also easily identify which change might have broken the system. As testing forms a major part of our development process, we have a dedicated section, [Testing and Quality Assurance (QA)](#testing-and-quality-assurance-\(qa\)), documenting our testing strategy and efforts.\
\
For where the requirements and the execution is clear. Test-driven development is preferred as it helps to automatically check if our code is working as expected, and that any edge-cases have been successfully handled.

### Iterative Development

However, Test-Driven Development (TDD) may not be suitable for all aspects of our application. For rapidly evolving or experimental parts of the code, iterative development is often more optimal due to its incremental nature, allowing features to be built up step-by-step.\
\
In scenarios where the code changes frequently, adding numerous tests can be counterproductive and impede the development workflow. Additionally, some features may lack a clear implementation approach, making it impossible to define requirements before coding. In such cases, tests should be used to verify the correctness of the code after it has reached a reasonable level of completion, rather than starting with tests to assert correctness from the outset.

### Balancing Them in our Development Process

Test-Driven Development (TDD) shines in stable and predictable environments where the logic is well-defined and unlikely to change frequently.

* ml\_service – The service's requirement is clear: input an mp3 file or YouTube link, and output a PDF, MusicXML, and MIDI file. After setting up the main logic, refining and adding new models requires minimal changes, making TDD a suitable approach.
* backend\_client – Initially, we adopted an iterative approach due to uncertainties around authentication, API design, and code organization. As the codebase grew, particularly when adding the extension for YouTube Link conversion, we encountered numerous edge cases. This complexity prompted a shift to TDD to ensure comprehensive coverage and prevent issues with the existing logic.

Iterative Development is more suited for projects with fast-paced changes, especially in user-facing services:

* Web Frontend & Telegram Bot – UI elements, layouts, and text are in constant flux, and establishing fixed requirements early on is challenging. Iterative development allows us to quickly adapt to design changes without the burden of constantly updating test cases. This approach enhances flexibility and speeds up the development process, especially in the face of evolving user demands.

By mixing TDD where stability and accuracy are paramount, and iterative development where flexibility is key, we strike the right balance for our system’s needs.

## Modularity and Extensibility

Each service is written with modularity and code extensibility in mind. This means that new features should be able to be integrated without breaking the code base. Apart from unit tests, below are some strategies we used to ensure modularity:

### Feature Folder Structure

Instead of organizing our code by types (e.g., services, models, routers, components), we adopted a feature-based folder structure. This approach has several benefits:

* Cohesion: By grouping all files related to a specific feature (components, services, styles, tests) together, the structure ensures that all aspects of a feature are co-located. This makes it easier to understand and manage the code, as developers can quickly locate everything related to a particular feature in one place.
* Separation of Concerns: Each feature operates independently within its own folder, reducing dependencies between different features. This isolation of features minimizes the risk of unintended side effects from changes and makes the codebase more maintainable and robust.

In addition, we use types only for shared components, further ensuring that each feature remains modular and self-contained. This structure supports both scalability and ease of development, especially as the project grows.

### Configuration Files

To ensure flexibility and ease of modification, we use configuration files throughout the application. These files allow us to adjust the program's behavior without directly modifying the codebase. Some key configurations include:

* JSON Translation Files: These support different languages by storing translations for various strings, rather than hardcoding them into the code (a pending feature).
* Environment Variables: Configured in .env files, they define different domains, ports, and settings for development and production environments.

For Docker, we utilize two configuration files:

* docker-compose.production.yml: This file pulls Docker images from the registry and configures the production environment.
* docker-compose.environment.yml: This builds Docker images from the current code base, ideal for testing during development.

This setup allows for testing development code with production configurations and vice versa by swapping environment variables. Additionally, each repository has its own config file, serving as the central point for dynamic data.

This approach enhances flexibility and promotes consistency across the codebase by centralizing the management of dynamic data, reducing the risk of errors, and enabling smoother transitions between environments.

# Summary

In this post, we explored the design decisions made in the development of MakeMySheet, including the use of patterns like Singleton, Pub/Sub, and work queues to ensure scalability, flexibility, and fault tolerance across microservices. We also highlighted the importance of configuration management, the application of the Single Responsibility Principle (SRP), and the balance between TDD and iterative development approaches.

Next, we'll dive into Testing and QA practices, detailing how we ensure the reliability and robustness of our system through various testing strategies and tools.
