# Fireflies.ai Backend

This project is a toy project based on Fireflies.ai Meeting Assistant.

## Prerequisites

Ensure that you have Docker installed. If you don't have Docker yet, refer to the following installation guides:

- Windows: [Install Docker on Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- Mac: [Install Docker on Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- Linux: [Install Docker on Linux](https://docs.docker.com/desktop/setup/install/linux/)

## Getting Started

Once you have Docker enabled, you can use the provided Makefile for easy project management.

Before that

```
cp .env.example .env
```

and setup the provided credentials based on your need

- Run the project: `make run`
- Stop the project: `make down`
- Run tests: `make test`

## Project Structure

```
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
│   ├── api/
├── services/
├── tests/
├── types/
├── utils/
├── validation/
└── server.ts
```

## API Endpoints

### Auth

- `POST /api/auth/login`

  - Description: Login user
  - Validation: Validates the required fields in the request payload.
  - Notes : Generic error response given to prevent brute-forcing which credentials are at fault [LLM09:2023](https://owasp.org/www-project-top-10-for-large-language-model-applications/Archive/0_1_vulns/Improper_Error_Handling.html)

- `POST /api/auth/register`

  - Description: Creates a new user.
  - Validation: Validates the required fields in the request payload.
  - Notes: Password are given maximum 50 chars, to prevent bcrypt overloading at > 72 chars [Bcrypt Max Password Length](https://security.stackexchange.com/questions/39849/does-bcrypt-have-a-maximum-password-length)

### Meetings

- `GET /api/meetings`

  - Description: Retrieves all meetings for the authenticated user in paginated format.
  - Validation: Authenticated user only. Retrieves meetings based on the authenticated user ID.

- `POST /api/meetings`

  - Description: Creates a new meeting with title, date, and participants.
  - Validation: Validates the required fields in the request payload.

- `GET /api/meetings/:id`

  - Description: Retrieves a specific meeting by ID, including its tasks.
  - Validation: Validates the meeting ID and handles errors if the meeting is not found.

- `GET /api/meetings/:id/sentiment`

  - Description: Retrieves the sentiment analysis of a specific meeting by ID.

- `PUT /api/meetings/:id/transcript`

  - Description: Updates a meeting with its transcript.
  - Validation: Validates the transcript data being uploaded.

- `POST /api/meetings/:id/summarize`

  - Description: Generates a summary and action items for a meeting.
  - Validation: Validates the request payload format and required fields.

- `GET /api/meetings/stats`
  - Description: Returns statistics about meetings, such as the total number of meetings, average number of participants, and most frequent participants.
  - Validation: Follows the data structure defined in the type file.

### Tasks

- `GET /api/tasks`
  - Description: Returns all tasks assigned to the authenticated user in paginated format.

### Dashboard

- `GET /api/dashboard`
  - Description: Returns a summary of the user's meetings, including count and upcoming meetings, task counts by status, and past due tasks.
  - Validation: Follows the data structure defined in the type file.

## Issues Found and Addressed

### Meetings

- `GET /api/meetings`
  - Issue: It attempted to fetch all meetings without filtering by authenticated user.

### Dashboard

- `GET /api/dashboard`
  - Issue: It attempted to fetch all meetings without filtering by authenticated user.

## Known Issues

### Security Issues

#### Authentication

- Authenticating API
  ```typescript
  export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const userId = req.header("x-user-id");
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    req.userId = userId;
    next();
  };
  ```
  - Issues:
    - Lack of Token Validation: The middleware relies solely on the presence of an `x-user-id` header to authenticate the request. It doesn't validate the authenticity or integrity of the user ID. Anyone can potentially send a request with any user ID in the header, and the middleware will consider it authenticated.
    - No Encryption or Signature Verification: The user ID is passed in plain text in the header, without any encryption or digital signature. This makes it vulnerable to interception, tampering, or impersonation attacks. An attacker could easily modify or forge the user ID header.
  - Addressed:
    - Use JWT Token with expiration

#### Request Size Limit

- Issues:
  - Lack of Request Size Limit: Not setting up a request size limit could potentially lead to DoS attacks with large payloads.
- Addressed:
  - Added Request Size Limit

#### Rate Limiter

- Issues:
  - Lack of Rate Limiter: Not setting up a rate limiter could potentially lead to DoS attacks with large requests.
- Addressed:
  - Added Rate Limiter

### Performance Issues

#### Indexing

- Issues:
  - Lack of Indexing: Not setting up proper indexes can lead to the database querying all data without using an index, which can result in slowdowns when the data scales.
- Addressed:
  - Added indexes for queries

#### Caching

- Issues:
  - Lack of Caching: Not setting up proper caching for frequently accessed data that rarely changes can lead to unnecessary queries to the database every time a user hits the endpoint.
- Addressed:
  - Added caching for `/dashboard` and `/stats` endpoints
