---
title: MakeMySheet Design Doc Part 1
published_at: 2025-02-09T16:00:00.000Z
---

# Introduction to MakeMySheet

**Note:**\
MakeMySheet ([makemysheet.com](http://makemysheet.com/)) is an AI music transcriber tool that converts music audio into music sheet. MakeMySheet is a project I created with [https://github.com/apollo-tan](https://github.com/apollo-tan) for NUS Orbital at the Artemis level. The contents here were taken from our ReadMe, with some portions cut off to reduce redundancy. This post will be broken down into multiple parts and will provide a comprehensive documentation of [makemysheet.com](http://makemysheet.com/), from User Stories, High Level Design, Design Decisions, Software Engineering Practices, and technical implementations, amongst many other things. However, do note that the ideas shared here may not be the best. MakeMySheet is currently undergoing refactoring to ensure best practices are maintained.

---

MakeMySheet is an AI-driven tool designed to convert audio files into piano sheet music, catering to hobbyist musicians, aspiring songwriters, music students, and professionals. It provides an efficient way to transcribe pop songs into piano arrangements, eliminating the need for manual transcription. The platform offers both a web interface and a Telegram bot for easy access to the service.

## Motivation

The project stems from a passion for music, especially for those who wish to play piano covers but lack the technical expertise for transcribing and arranging songs. While quality arrangements are available online, they often come at a cost, and free resources may be inaccurate. MakeMySheet aims to offer an accessible solution by automating transcription, benefiting both hobbyists and professional musicians alike.

## User Stories

- Enthusiast Instrumentalists: Upload audio and receive piano sheet music for covers or leisurely play.
- Bandmates: Identify harmonies and vocal parts, collaborate on arrangements for events or gigs.
- Music Teachers: Quickly generate sheet music for popular songs to engage students.
- Aspiring Songwriters: Transcribe audio recordings into sheet music for analysis and sharing.
- Professional Musicians: Generate rough drafts of sheet music for live performances.
- Music Producers: Transcribe tracks into sheet music for remixing or rearranging.
- Music Students: Transcribe pop songs for coursework and analyze compositions.

## Service Overview and Tech Stack

- Web Frontend: React with Next.js (TypeScript), Redux
- Web API Backend: Node.js, Express.js (TypeScript)
- ML Service: Python-based Pop2Piano
- Telegram Bot: Node.js, Telegraf (TypeScript)
- Message Queue: RabbitMQ
- Authentication: Auth0 (OAuth 2.0, JWT)
- Database: PostgreSQL with CockroachDB
- File Storage: AWS S3
- DevOps: Docker Compose for service orchestration

## Core Features

- Audio File Conversion: Upload audio and receive a PDF piano arrangement, with file storage in AWS S3.
- Interactive Music Sheet: View and interact with MIDI playback, compare with original audio.
- Companion Telegram Bot: Access features via Telegram with a minimal interface.
- Support for Various Arrangements: Generate different musical arrangements, including instrumentals and vocals.
- YouTube/Spotify Links: Accept links for audio input.
- Public Sheet Availability: Set and view public music sheets.

## Architecture Overview

MakeMySheet follows a microservices architecture, designed for scalability and minimal coupling. The core services are hosted on EC2 instances with Docker Compose, while communication between services is handled via RabbitMQ. The backend integrates with PostgreSQL (hosted on CockroachDB) and uses AWS S3 for file storage. Nginx serves as a reverse proxy, and OAuth 2.0 is used for authentication via JWT.

### Communication Between Services

The system operates as follows:

1. The user uploads an audio file via the web frontend or Telegram bot.
2. The backend saves job data and media to S3 and queues the job.
3. The ML service processes the job, storing results in S3.
4. Job completion or failure is communicated via RabbitMQ, and the backend updates the status, sending notifications back to the frontend or Telegram.

### Message Queue Design

Originally, a Pub/Sub model was used but was found to be unsuitable due to scalability issues. A Work Queue design was implemented to better distribute tasks among multiple worker nodes, preventing bottlenecks. The Work Queue offers several advantages:

1. Load Distribution: Tasks are spread across multiple workers, preventing overloads.
2. Scalability: The number of worker nodes can be easily adjusted.
3. Fault Tolerance: Failed tasks are requeued for processing by another worker.
4. Decoupling: The services are decoupled, allowing better separation of concerns and flexibility in architecture.

### Load Management

The queues in MakeMySheet act as buffers to manage the flow of messages between producers (clients) and consumers (backend services). Producers send messages to the queue, where they are stored until consumers are ready to process them. This decouples message production from message consumption, enabling each to operate at its own pace.

Unlike traditional REST APIs, which require clients to wait for immediate server responses, queues provide an asynchronous approach. This allows the backend to handle large loads or spikes in demand without overwhelming the server. In the case of a high message influx, RabbitMQ stores the tasks in a queue. Consumers then process these tasks as they are ready, ensuring that no consumer is overwhelmed by sudden bursts of requests. For REST APIs, each request is processed in real time, making it difficult to handle surges in traffic without risking slower response times or server failures.

### Fault Tolerance

RabbitMQ offers built-in message acknowledgment, ensuring that messages are only removed from the queue once they are successfully processed. This guarantees that messages persist even in the event of a server failure. Additionally, queues can be set to durable, ensuring that the queue data survives broker restarts. In the event of a failure, the messages will still reach their intended destination once the system recovers.

### Event-Driven Communication: Websockets and Webhooks

When the ML service completes its process, the frontend clients need to be notified of the result. Here’s how we achieve that using Websockets and Webhooks:

1. Web Frontend (Websockets):
2. After submitting a POST request to /api/convert or /api/telegram/convert, the request returns a job ID.
3. The web frontend connects to the backend via WebSocket, listens for the "messageFromServer" event, and navigates to a loading screen.
4. Upon receiving a result from RabbitMQ, the backend emits the "messageFromServer" event over the WebSocket, signaling that the job is done.
5. The WebSocket connection is then closed, and the frontend navigates to the result page.
6. Telegram Client (Webhooks):
7. The Telegram bot sends the callback_url in the request body when calling /api/telegram/convert.
8. Once the ML process is complete, the backend receives the result from RabbitMQ and calls the provided callback_url to notify the Telegram bot.
9. The callback URL is an endpoint exposed in the Telegram service, which processes the callback and updates the user on the conversion completion.

#### Benefits of Event-Driven Communication over Direct HTTP Requests

While HTTP POST requests could be used to initiate a conversion, this approach has limitations. Since the conversion process is long-running, a direct HTTP request would result in timeouts or delays. Using event-driven communication, with RabbitMQ and Websockets/Webhooks, allows the server to immediately acknowledge the request without blocking, reducing client-side waiting time and avoiding timeouts.

The decoupling of task initiation and completion provides asynchronous processing, which enhances reliability. RabbitMQ ensures that tasks are processed without loss, and clients are notified in real time via Websockets (for web clients) or Webhooks (for Telegram). This approach improves system scalability and fault tolerance, enabling a more efficient and responsive service.

### API Contract

In a microservices infrastructure, a well-defined API contract is essential for maintaining modularity and extensibility. Below is the API contract for the /convert endpoint, which caters to both web and Telegram clients.

#### /convert POST Request Body

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

#### /convert POST Response Body

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

#### Key Notes:

- source: Indicates the client type (either "telegram" or "web_frontend").
- user_id, song_name, audio_url: Required for task initiation.
- additional_data: Holds client-specific data, like the WebSocket ID (for web clients) or Telegram-specific details.
- callback_url: For Telegram clients, where the backend will send updates once the task is complete.
- output: The generated files (MIDI, MusicXML, PDF) are returned after the processing is complete.

By making the backend generic and adaptable, we ensure that different client types, including open-source API clients, can utilize the service efficiently. The system's flexibility helps extend the platform to other clients in the future, maintaining a high level of scalability and reliability.

### Dockerization and Cross-Platform Compatibility

- All services are packaged as Docker images and share the default "bridge" network defined in the Docker Compose configuration. This simplifies service-to-service communication using service names (e.g., `http://backend:5000`), resolving to the container’s IP.
- For browser access, use `http://localhost:5000` for development or `https://api.makemysheet.com` for production.
- Docker allows cross-platform development, enabling consistent builds on Windows and Mac without requiring local installation of dependencies (e.g., RabbitMQ).

#### Simplified Deployment

- By using Docker images, services like RabbitMQ are pulled and run directly, eliminating the need for complex local setups and ensuring consistent environments across systems.

### Security: Authentication and Authorization

#### Overview

- OAuth 2.0 with Auth0 handles authentication. The frontend logs in via Auth0 and receives an access token, which is passed as a JWT for backend calls. The token is set to expire after 30 days, with refresh tokens handling auto-renewal.
- RS256 asymmetric encryption is used for JWT validation, with dynamic generation of public keys using the OAuth 2.0 `.wellknown` endpoint.

#### Authentication on API Gateway Level

- JWT validation is centralized at the API gateway level, where a middleware verifies the token and injects user data into requests. This ensures consistent security policies across services, simplifying authentication management.
- The ML service is isolated within a Virtual Private Cloud (VPC) and can only be accessed through RabbitMQ, further securing the system.

#### Telegram Endpoint Authentication

- Telegram endpoints use a custom middleware that checks the bot token (stored as an environment variable) and the Telegram user ID against the RegisteredTelegramUser database. This ensures that only authenticated and authorized Telegram users can access the endpoints, as registration requires explicit user consent via the Telegram app.

### CI/CD Pipeline and Microservices Architecture

Our application follows a microservices architecture with each service in its own GitHub repository. Each repository has two workflows for development and production. The workflows trigger Docker builds on pull requests, run unit tests, and push images to the Docker registry. The production workflow SSHs into the AWS server, pulls the new Docker images, and runs them. We enforce PRs to the development branch first and only merge to the main branch once checks are complete.

### ML Service: Pop2Piano and MIDI Conversion

The core functionality of our app relies on the Pop2Piano model, which converts pop music audio to MIDI. We use Spotify's Basic Pitch model for instrument detection, and the output is then converted to a PDF piano score.

Initially, we explored Music21 and LilyPond for MIDI to PDF conversion but found the output inadequate. After experimenting, we integrated MuseScore 4 into our Docker container, which provided the best quality output. Converted PDFs are stored in an S3 bucket for easier access due to file size limitations.

#### Challenges and Solutions

- Model Integration: Pop2Piano was chosen for its promising results despite limited documentation. We overcame installation issues with WSL2 and Docker.
- MIDI to PDF Conversion: We tested multiple tools but ultimately used MuseScore 4 for high-quality notation. It’s run in a headless Docker container.
- File Storage: Converted PDFs are stored on an S3 bucket to address file size issues in HTTP transfers.

This approach ensures a robust CI/CD pipeline and efficient handling of complex music data processing tasks.

### Migration to RabbitMQ

To improve ML inference performance, we migrated from a Flask server to a RabbitMQ-based work queue, enhancing efficiency and scalability for task handling.

### Model Training and Refinement

Training Pop2Piano faced hurdles such as limited access to quality data and insufficient hardware. Online platforms like Google Colab and SageMaker had limited computational power and usage caps, further slowing progress.

### Database and Storage

- CockroachDB: We used CockroachDB for a serverless PostgreSQL database with two schemas: Conversion (storing conversion history) and RegisteredTelegramUser (mapping Auth0 users to Telegram accounts). The backend client is the sole service with database credentials, ensuring secure access.
- S3 Bucket: Initially, we stored audio files as base64, causing latency issues. We shifted to generating pre-signed S3 URLs for more efficient uploads. For large files, we leveraged Telegram’s file hosting, but faced security concerns. In Milestone 2, we migrated S3 URL generation to the backend for enhanced security and scalability.

### Hosting and EC2 Configuration

- Milestone 1: Started with T2.micro, but ML service performance led to upgrading to T2.medium. Exposed multiple ports (HTTP, HTTPS, Backend, Frontend, SSH) for access.
- Milestone 2: Implemented Nginx with SSL and domain setup to avoid exposing ports directly. Used reverse proxy for port mapping.
- Milestone 3: Faced scalability issues as all services ran on a single EC2 instance. To resolve this:
- Separated the ML service into a new EC2 instance.
- Updated DNS records and reverse proxy configurations to direct traffic appropriately.

### Nginx Reverse Proxy

- Frontend on port 3000 and backend on port 5000 required reverse proxy setup.
- Implemented a proxy for WebSocket connections, redirecting them to wss\://api.makemysheet.com.

This restructuring improved performance, scalability, and security across our system.

## Summary

In this project, we optimised the workflow for a music-to-piano-sheet conversion system, starting with a shift to RabbitMQ for improved task handling, replacing the earlier Flask-based server. We faced challenges in model training due to limited access to high-quality data and insufficient computational resources, which slowed progress. We addressed these issues by using a serverless PostgreSQL database, CockroachDB, for secure data management, and streamlined file uploads with S3 pre-signed URLs, improving file handling performance.

Our hosting setup evolved through multiple milestones. Initially, we used a T2.micro EC2 instance, which struggled with resource limitations during ML processing. We scaled to a T2.medium and later split services into separate EC2 instances, improving performance and scalability. To enhance security and manageability, we introduced Nginx reverse proxy configurations for SSL and domain handling.

## What's Next

In the next section, we'll cover the system's features from the user's perspective, as well as the software engineering practices employed to ensure scalability, security, and efficient development.
