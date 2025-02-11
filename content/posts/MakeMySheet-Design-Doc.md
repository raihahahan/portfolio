---
title: MakeMySheet Part 2 - System Design
published_at: 2025-02-09T16:00:00.000Z
read_time: 9
prev_post: content/posts/MakeMySheet-Part-1---Introduction.md
next_post: ''
excerpt: System Design and Architecture
---

> [MakeMySheet](https://makemysheet.com) is an AI music transcriber tool that converts music audio into music sheet. MakeMySheet is a project I created with [Shi Xin](https://github.com/apollo-tan) for NUS Orbital at the Artemis level. The contents here were taken from our [ReadMe](https://drive.google.com/file/d/1MSCzP2GQiQ_NtrvwtkeRR3pjgD7xxjvQ/view), with some portions cut off to reduce redundancy. This post is part of a series of posts where I break down the technical decisions behind MakeMySheet.

# Introduction

This post covers the Architecture, CI/CD pipeline and Hosting of MakeMySheet. For an overview and explanation of its features, see the Introduction page.

# Architecture

![](/images/blog/makemysheet/image16.png)

MakeMySheet follows a microservices architecture, designed for scalability and minimal coupling. The core services are hosted on EC2 instances with Docker Compose, while communication between services is handled via RabbitMQ. The backend integrates with PostgreSQL (hosted on CockroachDB) and uses AWS S3 for file storage. Nginx serves as a reverse proxy, and OAuth 2.0 is used for authentication via JWT.

## High Level Design

![](/images/blog/makemysheet/image2.png)

The system operates as follows:

1. The user uploads an audio file via the web frontend or Telegram bot.
2. The backend saves job data and media to S3 and queues the job.
3. The ML service processes the job, storing results in S3.
4. Job completion or failure is communicated via RabbitMQ, and the backend updates the status, sending notifications back to the frontend or Telegram.

## Message Queue Design

Originally, a Pub/Sub model was used as seen below. The backend service publishes jobs while the ml service subscribes to the exchange routed by the "job" key. Simultaneously, the ml service publishes results to the exchange while the backend service subscribes to the route "result".\
\
However, we [ran into scalability issues](https://www.linkedin.com/posts/raihan-rizqullah_makemysheet-activity-7222552492658606080-zRKB?utm_source=share\&utm_medium=member_desktop) upon launching MakeMySheet to the public. With the pub/sub exchange, the spike in load resulted in a huge backlog in the exchange. Users had to wait long periods of time for their job to be processed. This is because only one instance of the ml service is subscribed to the exchange. As a result, the server crashed.

![](/images/blog/makemysheet/image6.png)

Instead, a Work Queue design was implemented to better distribute tasks among multiple worker nodes, preventing bottlenecks.\
\
As seen in the diagram below, we now have multiple replicas of the ML services to handle messages from the job queue. This means that the workload is spread amongst the worker nodes. Thus, each client spends a shorter time waiting for their job to be processed. Furthermore, the nodes follow a round-robin algorithm to assign tasks amongst one another efficiently.

![](/images/blog/makemysheet/image61.png)

The Work Queue offers several advantages:

1. Load Distribution: Tasks are spread across multiple workers, preventing overloads.
2. Scalability: The number of worker nodes can be easily adjusted.
3. Fault Tolerance: Failed tasks are requeued for processing by another worker.
4. Decoupling: The services are decoupled, allowing better separation of concerns and flexibility in architecture.

### Load Management

![](/images/blog/makemysheet/image13.png)

The queues in MakeMySheet act as buffers to manage the flow of messages between producers (clients) and consumers (backend services). Producers send messages to the queue, where they are stored until consumers are ready to process them. This decouples message production from message consumption, enabling each to operate at its own pace.\
\
Unlike traditional REST APIs, which require clients to wait for immediate server responses, queues provide an asynchronous approach. This allows the backend to handle large loads or spikes in demand without overwhelming the server. In the case of a high message influx, RabbitMQ stores the tasks in a queue. Consumers then process these tasks as they are ready, ensuring that no consumer is overwhelmed by sudden bursts of requests. For REST APIs, each request is processed in real time, making it difficult to handle surges in traffic without risking slower response times or server failures.

### Fault Tolerance

RabbitMQ offers built-in message acknowledgment, ensuring that messages are only removed from the queue once they are successfully processed. This guarantees that messages persist even in the event of a server failure. Additionally, queues can be set to durable, ensuring that the queue data survives broker restarts. In the event of a failure, the messages will still reach their intended destination once the system recovers.

### Event-Driven Communication: Websockets and Webhooks

When the ML service completes its process, the frontend clients need to be notified of the result. Here’s how we achieve that using Websockets and Webhooks:

1. **Web Frontend (Websockets)**:
   1. After submitting a POST request to /api/convert or /api/telegram/convert, the request returns a job ID.
   2. The web frontend connects to the backend via WebSocket, listens for the "messageFromServer" event, and navigates to a loading screen.
   3. Upon receiving a result from RabbitMQ, the backend emits the "messageFromServer" event over the WebSocket, signaling that the job is done.
   4. The WebSocket connection is then closed, and the frontend navigates to the result page.
2. **Telegram Client (Webhooks)**:
   1. The Telegram bot sends the callback\_url in the request body when calling /api/telegram/convert.
   2. Once the ML process is complete, the backend receives the result from RabbitMQ and calls the provided callback\_url to notify the Telegram bot.
   3. The callback URL is an endpoint exposed in the Telegram service, which processes the callback and updates the user on the conversion completion.

### Decoupling

![](/images/blog/makemysheet/image76.png)

While HTTP POST requests could be used to initiate a conversion, this approach has limitations. Since the conversion process is long-running, a direct HTTP request would result in timeouts or delays. Using event-driven communication, with RabbitMQ and Websockets/Webhooks, allows the server to immediately acknowledge the request without blocking, reducing client-side waiting time and avoiding timeouts.\
\
The decoupling of task initiation and completion provides asynchronous processing, which enhances reliability. RabbitMQ ensures that tasks are processed without loss, and clients are notified in real time via Websockets (for web clients) or Webhooks (for Telegram). This approach improves system scalability and fault tolerance, enabling a more efficient and responsive service.

## API Contract

In a microservices infrastructure, a well-defined API contract is essential for maintaining modularity and extensibility. Below is the API contract for the /convert endpoint, which caters to both web and Telegram clients.

**/convert POST Request Body**

```
{
  "source": "SourceType",
  "user_id": "string",
  "is_public": "boolean",
  "created_by": "string",
  "arrangement_type": "string",
  "additional_data": {
    "bot_token": "string", // only for telegram
    "telegram_id": "number", // only for telegram
    "chat_id": "number", // only for telegram
    "message_id": "number", // only for telegram
    "socket_id": "string" // only for web
  },
  "song_name": "string",
  "audio_url": "string", // for file upload
  "youtube_link": "string", // for youtube url
  "callback_url": "string" // only for telegram
}
```

**/convert POST Response Body**

```
{
  "source": "SourceType",
  "user_id": "string",
  "is_public": "boolean",
  "created_by": "string",
  "arrangement_type": "string",
  "additional_data": {
    "bot_token": "string", // only for telegram
    "telegram_id": "number", // only for telegram
    "chat_id": "number", // only for telegram
    "message_id": "number", // only for telegram
    "socket_id": "string" // only for web
  },
  "song_name": "string",
  "audio_url": "string",
  "youtube_link": "string",
  "callback_url": "string",
  "uuid": "string",
  "output": [{
    "midiUrl": "string",
    "musicXmlUrl": "string",
    "pdfUrl": "string",
    "type": "string"
  }]
}
```

### Key Notes

* source: Indicates the client type (either "telegram" or "web\_frontend").
* user\_id, song\_name, audio\_url: Required for task initiation.
* additional\_data: Holds client-specific data, like the WebSocket ID (for web clients) or Telegram-specific details.
* callback\_url: For Telegram clients, where the backend will send updates once the task is complete.
* output: The generated files (MIDI, MusicXML, PDF) are returned after the processing is complete.

By making the backend generic and adaptable, we ensure that different client types, including open-source API clients, can utilise the service efficiently. The system's flexibility helps extend the platform to other clients in the future, maintaining a high level of scalability and reliability.

## Containerisation: Docker Compose

* All services are packaged as Docker images and share the default "bridge" network defined in the Docker Compose configuration. This simplifies service-to-service communication using service names (e.g., `http://backend:5000`), resolving to the container’s IP.
* For browser access, use `http://localhost:5000` for development or `https://api.makemysheet.com` for production.
* Docker allows cross-platform development, enabling consistent builds on Windows and Mac without requiring local installation of dependencies (e.g., RabbitMQ).

### Simplified Deployment

* By using Docker images, services like RabbitMQ are pulled and run directly, eliminating the need for complex local setups and ensuring consistent environments across systems.

## Security: Authentication and Authorization

### Overview

* OAuth 2.0 with Auth0 handles authentication. The frontend logs in via Auth0 and receives an access token, which is passed as a JWT for backend calls. The token is set to expire after 30 days, with refresh tokens handling auto-renewal.
* RS256 asymmetric encryption is used for JWT validation, with dynamic generation of public keys using the OAuth 2.0 `.wellknown` endpoint.

### Authentication on API Gateway Level

![](/images/blog/makemysheet/image51.png)

* JWT validation is centralised at the API gateway level, where a middleware verifies the token and injects user data into requests. This ensures consistent security policies across services, simplifying authentication management.
* The ML service is isolated within a private IP address and can only be accessed through RabbitMQ, further securing the system.

### Telegram Endpoint Authentication

* Telegram endpoints use a custom middleware that checks the bot token (stored as an environment variable) and the Telegram user ID against the RegisteredTelegramUser database. This ensures that only authenticated and authorised Telegram users can access the endpoints, as registration requires explicit user consent via the Telegram app.

## ML Service: Pop2Piano and MIDI Conversion

The core functionality of our app relies on the Pop2Piano model, which converts pop music audio to MIDI. We use Spotify's Basic Pitch model for instrument detection, and the output is then converted to a PDF piano score.

### Music21

Music21 is a Python-based toolkit for computer-aided musicology developed by MIT. We found out that it was able to parse MIDI files into MusicXML which can later be converted into a PDF file.

![](/images/blog/makemysheet/image19.png)

However, the output was less than optimal. Firstly, all the notes were squeezed into one part, when a piano cover had two parts: a left and right hand. Secondly the way the notes were represented were also very strange and greatly deviated from what a normal piano score would look like. The poor output quality was supported by the fact that the Music21 documentation recommends that we use external software that were more specialised in this process, such as Finale.

### LilyPond

We realised that Music21 also supported a conversion from MIDI to LilyPond format, which is a file format used for another popular music notation software LilyPond.

![](/images/blog/makemysheet/image15.png)However, the program failed to split into Treble and Bass clef, and instead placed all the notes in one part. The program also failed to correctly identify the key and use appropriate key signatures, instead opting to put accidentals which complicates and clutters the notation.

### MuseScore

While MuseScore offers more than just a MIDI to PDF converter, and using it is definitely overkill for our use-case, it was the best solution we could find that strikes a good balance between efficiency and accuracy. We ended up downloading MuseScore 4 into our Docker Container, and using CLI commands to interact with it. This part proved to be challenging, as we were using MuseScore 4 in an unusual way and hence involved unfamiliar tasks, such as downloading external software into a container and configuring it for headless operation due to the lack of a graphical interface. We were finally able to convert MIDI files to PDF files. However, we soon encountered limitations regarding file size transmission over HTTP , prompting us to store conversions on an S3 Bucket for improved accessibility and retrieval by users.

### Migration to RabbitMQ

To improve ML inference performance, we migrated from a Flask server to a RabbitMQ-based work queue, enhancing efficiency and scalability for task handling.

## Database and Storage

![](/images/blog/makemysheet/image23.png)

* CockroachDB: We used CockroachDB for a serverless PostgreSQL database with two schemas: Conversion (storing conversion history) and RegisteredTelegramUser (mapping Auth0 users to Telegram accounts). The backend client is the sole service with database credentials, ensuring secure access.
* S3 Bucket: Initially, we stored audio files as base64, causing latency issues. We shifted to generating pre-signed S3 URLs for more efficient uploads. For large files, we leveraged Telegram’s file hosting, but faced security concerns. In Milestone 2, we migrated S3 URL generation to the backend for enhanced security and scalability.

# CI/CD Pipeline

Our application follows a microservices architecture with each service in its own GitHub repository. Each repository has two workflows for development and production. The workflows trigger Docker builds on pull requests, run unit tests, and push images to the Docker registry. The production workflow SSHs into the AWS server, pulls the new Docker images, and runs them. We enforce PRs to the development branch first and only merge to the main branch once checks are complete.

# Hosting

## EC2 Configuration

![](/images/blog/makemysheet/image16.png)

* Milestone 1: Started with T2.micro, but ML service performance led to upgrading to T2.medium. Exposed multiple ports (HTTP, HTTPS, Backend, Frontend, SSH) for access.
* Milestone 2: Implemented Nginx with SSL and domain setup to avoid exposing ports directly. Used reverse proxy for port mapping.
* Milestone 3: Faced scalability issues as all services ran on a single EC2 instance. To resolve this:
* Separated the ML service into a new EC2 instance.
* Updated DNS records and reverse proxy configurations to direct traffic appropriately.

## Nginx Reverse Proxy

* Frontend on port 3000 and backend on port 5000 required reverse proxy setup.
* Implemented a proxy for WebSocket connections, redirecting them to wss\://api.makemysheet.com.

This restructuring improved performance, scalability, and security across our system.

# Summary

In this project, we optimised the workflow for a music-to-piano-sheet conversion system, starting with a shift to RabbitMQ for improved task handling, replacing the earlier Flask-based server. We faced challenges in model training due to limited access to high-quality data and insufficient computational resources, which slowed progress. We addressed these issues by using a serverless PostgreSQL database, CockroachDB, for secure data management, and streamlined file uploads with S3 pre-signed URLs, improving file handling performance.\
\
Our hosting setup evolved through multiple milestones. Initially, we used a T2.micro EC2 instance, which struggled with resource limitations during ML processing. We scaled to a T2.medium and later split services into separate EC2 instances, improving performance and scalability. To enhance security and manageability, we introduced Nginx reverse proxy configurations for SSL and domain handling.

## What's Next

In the next section, we'll cover the system's features from the user's perspective, as well as the software engineering practices employed to ensure scalability, security, and efficient development.
