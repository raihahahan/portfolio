---
title: MakeMySheet Part 4 - Testing and QA
published_at: 2025-02-11T16:00:00.000Z
read_time: 12
prev_post: content/posts/MakeMySheet-Part-3---SWE-and-Design-Patterns.md
next_post: ''
excerpt: Quality Assurance
---

# Testing Strategy

Each repository includes its own tests, which run during the Dockerfile build process. If tests fail, the build fails, preventing deployment via CI/CD. This safeguards against pushing faulty code to production.\
\
Our testing strategy covers:

* Unit tests for small function and component validation.
* Specification tests to ensure adherence to requirements.
* Integration & End-to-End tests for system-wide stability.
* User testing to validate usability and problem resolution.

## Triaging

### Milestone 2

In Milestone 1, testing was largely overlooked to accelerate feature development. By Milestone 2, as we transitioned to test-driven development, we encountered challenges—particularly the overwhelming number of functionalities to test and the complexity of unit testing in our microservice architecture due to extensive mocking requirements.

#### Key Testing Challenges

1. Time & Resource Constraints – Full test coverage was impractical, requiring strategic prioritization.
2. Microservice Interdependencies – Testing services in isolation was difficult, as unit tests didn't always guarantee proper integration.

#### Our Approach

* Unit Testing for isolated components to minimize mocking. Crucial but interconnected components, like authentication middleware and ML inference functions, were also tested with mock data.
* Integration Testing prioritized for interdependent microservices, particularly within backend\_client, to ensure real-world functionality.
* End-to-End Testing was de-prioritized for automation due to our small front-facing features but will be implemented using Cypress in the next milestone.

#### Testing Priorities

We focused on the backend client as the single entry point of our system. Key areas included:

* Authentication to protect user privacy and security.
* API endpoints to ensure proper request handling and error management.

### Milestone 3

Building on Milestone 2, we significantly expanded our testing coverage by adding more integration and end-to-end tests, which were previously omitted. Additionally, we conducted extensive user testing, iterating on our application based on valuable feedback.\
\
These new tests primarily focused on the frontend, allowing us to simulate real user interactions and ensure a seamless experience. By integrating automated E2E testing with Cypress and incorporating real-world user feedback, we improved both the functionality and usability of our application.

## Testing Tools and File Organisation

We use a combination of testing tools to ensure our Node.js applications are reliable and maintainable.\
\
**Jest**

Jest is a powerful testing framework developed by Facebook, designed specifically for JavaScript applications. It provides a built-in test runner, assertion library, and mocking capabilities. This allows us to efficiently write and execute unit tests for both frontend and backend components.\
\
**React Testing Library**

Instead of testing implementation details, React Testing Library focuses on user interactions. It simulates how users interact with our UI, ensuring that components behave correctly in real-world scenarios.\
\
**Supertest**

For API testing, we use Supertest to send HTTP requests to our backend and validate the responses. This ensures that all endpoints return the expected data and handle errors correctly.\
\
**Cypress**

Cypress is our go-to tool for end-to-end testing, allowing us to test the entire application flow from frontend to backend. It provides real-time reloading and debugging, making it easier to maintain test suites that mimic actual user behaviour.\
\
**Configuration**

```
--jest.config.js
--jest.integration.config.js
--jest.unit.config.js
```

We created separate .config.js configuration files for unit and integration testing to specify the configurations required for the tests. We also created .env.test files (and its template .env.test.example) files to store environmental variables specific to the testing environment. We then added custom test scripts in the package.json file that allows us to run these tests immediately.\
\
**Python**

For the only Python service in our microservices architecture, the ml\_service, we used `pytest` as our testing framework. Due to the simplicity of the ml\_service, we organised our tests within a dedicated tests/ directory, keeping all test cases in one place for better maintainability. This structure ensures that our test suite remains clean and easy to navigate while covering all critical functionalities.\
\
We ensured that any packages installed for the purposes of testing are to be installed as development dependencies so they do not clutter the production build.

# Unit Tests

Unit tests are written in every service and run in the Dockerfile during the build process, as explained above. They can also be manually triggered from the command line in the root directory of each service, allowing you to easily run the unit tests while in development.

They are also run as part of the deployment checks during the docker build process, ensuring that any new PRs doesn’t break the current expectations of the application.

## Web Frontend

The web\_frontend is a Next.js project, so we used Jest with React Testing Library to test hooks and core functionalities. Tests run as part of the Docker build step before executing the Next.js build script.\
\
**1. Simple, Pure Functions (e.g., Utils)**

* Provide sample values and their expected results.
* Include values that result in both success and failure cases.
* Handle invalid sample values properly.

\
2\. **Hooks**

* Since hooks modify React component state, use @testing-library/react.
* Wrap hook calls in a callback using renderHook.
* Any state-modifying functions exposed by the hook should be wrapped in an act callback.

\
**3. Redux**

* Follow Redux’s official testing strategy with Jest.
* Prefer integration tests where everything works together.
* For a React app using Redux:
* Render a `<Provider>` with a real store instance wrapping the components.
* Use real Redux logic for interactions, mocking API calls only.
* Assert that the UI updates appropriately.
* Use unit tests only for complex reducers or selectors if necessary.
* Avoid mocking selector functions or React-Redux hooks as it is fragile and does not ensure app functionality.

## Backend Client

**1. Simple, Pure Functions (e.g., Utils)**

* Provide sample values and their expected results.
* Include values that result in both success and failure cases.
* Handle invalid sample values properly.

\
**2. Calls to Database**

* Create a mock database to simulate CRUD actions.

![](/images/blog/makemysheet/image27.png)

### Authentication Middleware

We performed extensive testing on the Authentication Middleware, focusing specifically on the `validateTelegram` and `checkJwt` middleware, which handle requests for both our Convert and Telegram endpoints. These components are critical to ensuring the security of our backend service by preventing unauthorised access.

![](/images/blog/makemysheet/image45.png)

### Request Body Validation

After successful authentication, most requests undergo body validation to ensure they are structured correctly before being processed. This validation is especially important for the conversion service, which is central to our application. The validation process occurs within the ConvertService class, which is responsible for handling conversion-related requests.

#### Workflow Overview

1. Authentication: After a successful authentication through either the web frontend or Telegram bot microservices, the request is forwarded to the corresponding endpoint.
2. Request Handling: The route handler invokes a method of the ConvertService class, such as the convert method.
3. Request Body Validation: The ConvertService method is responsible for validating the request body to ensure it meets the expected structure. This is done using helper functions designed to check the validity of incoming requests.

#### Example of Validation Logic

* Helper Functions: These functions check for required fields, data types, and any other business logic that is relevant to the conversion process.
* Invalid Request Handling: If the request body does not match the expected structure, the validation functions throw an error, ensuring that only valid requests reach the core business logic.

![](/images/blog/makemysheet/image65.png)

We have extensively tested this validation process to ensure that invalid or malformed request bodies are caught early and the application can respond with an appropriate error (e.g., 400 Bad Request). This ensures that only correctly structured requests are processed, preventing unnecessary failures downstream and maintaining the integrity of the conversion process.

## Telegram Client

**1. Simple, pure functions (e.g. utils)**

Provide sample values and its expected results. For sample values, provide values that result in both success and failure of the function. Invalid sample values are also handled.

\
**2. Authentication**

![](/images/blog/makemysheet/image17.png)

## ML Service

**1. Simple, pure functions (e.g. utils)**
Provide sample values and its expected results. For sample values, provide values that result in both success and failure of the function. Invalid sample values are also handled.

\
**2. Interactions with S3**
Create mock S3 calls with the expected HTTP response and requests.

# Integration Tests

## Conversion Process

| **Workflow**                                                                         | **General Flow**                                                                                                                                                                                                                                                                           | **Required Services** |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| A: Web sends conversion request to Backend                                           | Web calls the upload function using mock data to send a conversion request. API to handle file upload is called. The API to handle file upload generates a pre-signed S3 URL. API to invoke the backend is called. Backend receives the request and generates UUID. Web receives UUID.     | web backend           |
| B: Backend publishes to job queue                                                    | In the conversion POST endpoint, upon sending UUID to the client, backend publishes a Rabbitmq message  ml service receives this message.                                                                                                                                                  | backend ml  rabbitmq  |
| C: ml publishes to result queue                                                      | ml process the RabbitMQ message  ml publishes to the job queue  Backend receives a message from the job queue.                                                                                                                                                                             | backend ml  rabbitmq  |
| D: Backend handling a result message for Web (depends on completion of (A, B, C)     | backend handles result message that is for the web  backend broadcasts a websocket connection to inform the web service that the conversion has finished. frontend receives the websocket message.  frontend navigates to the result page.   frontend fetches data with the received UUID. | web backend rabbitmq  |
| E: telegram sends a conversion request                                               | Telegram bot uploads audio and sends conversion request  Backend receives the request and generates UUID. Telegram bot receives uuid                                                                                                                                                       | telegram backend      |
| F: Backend handling a result message for Telegram (depends on completion of E, B, C) | backend handles result message that is for the telegram service backend calls the callback URL  telegram’s result function gets invoked telegram sends pdf result                                                                                                                          | telegram backend      |
| G: Test CRUD endpoints for Conversion table                                          | CRUD function called in ConvertClient of web project. Next.js API endpoint invoked. backend receives the appropriate request and does CRUD on the test database backend returns the appropriate response back to web web receives the response from the backend.                           | web backend           |

## Backend Client

### Testing Database Integrations

We focused on testing the integration with CockroachDB to ensure the basic CRUD operations were functioning correctly. This testing validated that our database interactions, such as creating, reading, updating, and deleting records, performed as expected.

### Testing AWS S3 Integration

We also tested the integration with AWS S3 to ensure that file uploads and retrievals were working seamlessly. This is critical for our application as we rely on S3 for file storage. Ensuring this integration is robust helps avoid potential data loss or performance issues when interacting with cloud storage.

### API Endpoint Testing with Supertest

To simulate actual API calls from our frontend clients, we used Supertest to test calls to selected endpoints, especially those related to Telegram bot user registration. This allowed us to verify the functionality of the API endpoints, ensuring that data was processed correctly and responses were returned as expected.

### JWT Token Testing

Finally, we tested the router endpoints to ensure that missing or invalid JWT tokens would prevent authentication. This is a crucial security measure to prevent unauthorized access to our endpoints. By ensuring that requests without a valid token are rejected, we help secure sensitive user and application data.

# End-to-End Tests

Finally, end-to-end tests are the most crucial part of our testing strategy. Since our users interact with the application through one of the two frontend clients we provide, the web\_frontend and the telegram\_bot, we will focus on triggering end-to-end tests from these two entry points.

The characters (e.g. A, B, C etc.) below refer to the workflows defined in the tables under [Integration Tests](#conversion-process).

| Workflow           | Description                                         |
| ------------------ | --------------------------------------------------- |
| Conversion process | Web frontend: A → B → C → D Telegram: E → B → C → D |

## Web Frontend E2E Testing

Cypress is used for end-to-end testing to simulate real user behavior through a browser, helping identify edge cases. Its interactive UI simplifies debugging and provides insights into test execution.

Example: E2E testing revealed an edge case where a valid audio file with an invalid YouTube link failed to upload. Despite the "Convert with Uploaded File" button being enabled, a warning toast correctly notified the user about the invalid YouTube link, preventing the conversion.

### Cypress Sessions

We leveraged Cypress sessions to cache frequently used data, like the logged-in test user and test conversions. This approach avoids repeating actions in every test, speeding up execution and reducing the load on our services.

![](/images/blog/makemysheet/image30.png)

```typescript
Cypress.Commands.add(
  "loginToAuth0",
  (
    username: string = TEST_USER_EMAIL,
    password: string = TEST_USER_PASSWORD
  ) => {
    const log = Cypress.log({
      displayName: "AUTH0 LOGIN",
      message: [`🔐 Authenticating | ${username}`],
      // @ts-ignore
      autoEnd: false,
    });
    log.snapshot("before");

    cy.session(
      `auth0-${username}`,
      () => {
        loginViaAuth0Ui(username, password);
      },
      {
        validate: () => {
          cy.window().then(win => {
            cy.log("localStorage", win.localStorage);
          });

          // This is for other forms of authentication
          // cy.wrap(localStorage, { timeout: 10000 })
          //   .invoke("getItem", "authAccessToken")
          //   .should("exist");

          // Validate presence of session token in cookies.
          cy.getCookie("next-auth.session-token").should("exist");
        },
        cacheAcrossSpecs: true, // Session Data persists across specs
      }
    );

    cy.visit("/");
    log.snapshot("after");
    log.end();
  }
);
```

### Index Page

The Index Page is the core of our application, so we prioritised it for end-to-end testing by creating a series of test cases that address various edge cases and user behaviours. We covered a broad range of scenarios, testing the UI's response to numerous invalid inputs, such as excessively large audio files or invalid YouTube links.

![](/images/blog/makemysheet/image36.png)

### Results Page

The results page is also a very crucial page as it displays the result of a successful conversion. The testing strategy here is to check if the is editable, and whether the various buttons work as expected. We check if the download buttons actually download the files by checking if it’s present in the Cypress downloads folder which stores the files that are downloaded.\\

![](/images/blog/makemysheet/image40.png)

### History and Search Pages

For the Search and History pages, we first generated a test conversion, of which we will then test whether it can be accessed and manipulated from the Search and history page respectively. We decided to rename the file to the conversionID to enable it to be more easily searched and tested upon.

### Authentication

We’ve dedicated an entire test-suite that extensively tests the authentication system of our frontend application.

![](/images/blog/makemysheet/image36.png)

### Cypress Automated Test Demo Video

Click [here](https://drive.google.com/open?id=1GSRnhAbnFoej0MhMJ_oPrc2IYOsZUq8Z) to watch a video of our fully automated test using Cypress.

# User Testing

## Preliminary Testing

We chose to initially user-test with a select group of individuals to gather focused feedback and address key issues in a controlled environment. This approach allowed us to make targeted improvements and refine the application before scaling up. By managing resources efficiently and mitigating risks, we ensured that the application was better prepared for broader testing and more diverse user feedback in later stages.

### Methodology

##### Participants

* 10 friends with varying technical expertise participated in the testing.

Testing Environment

* Testing will be conducted using the production URL.

Testing Tools and Resources

* Google Forms for feedback collection.
* JIRA for bug tracking.

Test Scenarios

1. Register and Login
2. Create conversion requests on the web frontend.
3. View the conversion history.
4. Use the Search feature to view publicly available sheet music.
5. Register to use the Telegram bot.
6. Create conversions from the Telegram bot.

### Execution

Process

* Participants will be provided with the production URL and asked to perform specified tasks.

Instructions

* Participants will be given a brief overview of the tasks and were asked to report any issues or provide feedback via Google Forms. \[Pending]

Findings

| Bug                                                                                                        | Steps to reproduce                                                                                                                                               | Improvements and changes                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversion fails for files larger than 1MB                                                                 | Upload a file larger than 1MB An error alert will appear                                                                                                         | Previous implementation used the conversion of the audio file to base64 string and was passed around the microservices. The base64 encoding was really large and the backend service was hitting an entity too large error. Decoding from base64 is also resource intensive. Change: Instead of encoding into base64, immediately upload the audio as a URL. This requires hosting the audio somewhere, which, in our case, is the S3 bucket. |
| Login with OAuth account and login with username password of that same account is not considered duplicate | Register an account with OAuth. Register another account with email and password. Both are considered different accounts, when they are supposed to be the same. | In Progress: Create a separate User Management service to handle Auth0 specific logic.                                                                                                                                                                                                                                                                                                                                                        |
| Telegram conversion does not work after the latest v1.2.0 update.                                          | Create a conversion request. The bot will always return an error message.                                                                                        | Change: The new update requires the Telegram bot to temporarily download an audio file and store it into a folder. However, this folder does not exist. Thus, we mapped a new Docker volume to create this folder.                                                                                                                                                                                                                            |

### Beta Testing

We created a [LinkedIn Post](https://www.linkedin.com/posts/raihan-rizqullah_makemysheet-activity-7222552492658606080-zRKB?utm_source=share\&utm_medium=member_desktop) to publicise our application to test out our application and fill up the feedback form. The aim of this was to reach out to our connections in hopes of receiving more technical-oriented feedback from this group of respondents.

# Summary

TLDR; testing is important.
