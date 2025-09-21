# SIH-Backend API Documentation

This backend provides OTP-based registration, login, and authentication using email. It also includes admin functionality for user deletion and a logout endpoint.

---

## Base URL
```
http://localhost:5001/api/auth
```

---

## 1. Register (Send OTP to Email)
- **Endpoint:** `POST /register`
- **Body (JSON):**
```
{
  "name": "Rahul",
  "dob": "2000-01-01",
  "qualification": "12", // or "10"
  "state": "Karnataka",
  "district": "Kalaburagi", // or "Koppal"
  "email": "user@example.com"
}
```
- **Response:**
```
{
  "message": "Registered successfully, OTP sent to email"
}
```

---

## 2. Login (Send OTP to Email)
- **Endpoint:** `POST /login`
- **Body (JSON):**
```
{
  "email": "user@example.com"
}
```
- **Response:**
```
{
  "message": "OTP sent to email"
}
```
- **Note:** If the user is already logged in, response will be:
```
{
  "message": "User already logged in. Please logout first."
}
```

---

## 3. Verify OTP (Get JWT)
- **Endpoint:** `POST /verify-otp`
- **Body (JSON):**
```
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- **Response:**
```
{
  "message": "OTP verified",
  "token": "<jwt_token>"
}
```

---

## 4. Access Dashboard (Protected)
  - `Authorization: Bearer <jwt_token>`
- **Response:**
```
{
  "user": {
    "_id": "...",
    "dob": "2000-01-01T00:00:00.000Z",
    "qualification": "12",
    "state": "Karnataka",
    "district": "Kalaburagi",
    "email": "user@example.com",
    "isLoggedIn": true
  }
}
```

---
## 5. Logout (Protected)
- **Endpoint:** `POST /logout`
- **Response:**
{
  "message": "Logged out successfully"
}
```

---

## 6. Admin Delete User (Protected)
- **Endpoint:** `DELETE /admin/delete-user`
- **Body (JSON):**
```
{
  "email": "user@example.com",
}
```
- **Response:**
```
{
  "message": "User deleted successfully"
}
- **Error (wrong password):**
```
}

---

## Notes
- All OTPs are sent to the user's email using the configured Gmail account.
- JWT tokens are required for all protected endpoints (dashboard, logout).
- Admin password is set in the `.env` file as `ADMIN_PASSWORD`.
---

## Example Usage (Frontend)
1. Register user → receive OTP on email.
4. Admin can delete users by email using the admin password.
---


---

## 7. Get Dynamic Quiz (AI-powered)
- **Endpoint:** `GET /quiz`
- **Headers:**
  - `Authorization: Bearer <jwt_token>`
- **Response:**
```
  "quiz": [
      "question": "Which subjects do you enjoy the most?",
      "options": ["Mathematics", "Biology", "Physics", "Chemistry", "Computer Science"]
  ]
```
- **Note:** Quiz is generated dynamically by Gemini based on the user's qualification (10th/12th) and specialization (if 12th).

---

- **Endpoint:** `POST /quiz/submit`
- **Headers:**
  - `Authorization: Bearer <jwt_token>`
- **Body (JSON):**
```
{
  "answers": ["Mathematics", "Engineering", "Yes"]
}
```
- **Response:**
```
{
  "suggestion": [
    {
      "stream": "Computer Science & Engineering (CSE)",
      "degree_programs": ["B.Tech/B.E. in Computer Science and Engineering", ...],
      "explanation": "...",
      "career_paths": [
        {
          "title": "Software Developer/Engineer",
          "description": "...",
          "mermaid": "```mermaid\ngraph TD; A[12th Science] --> B[B.Tech CSE]; B --> C[Software Developer]; ...```"
        ...
      ]
```

---

- Use `/quiz` to get a personalized quiz for the logged-in user.
- Submit quiz answers to `/quiz/submit` to get detailed, AI-generated career and course suggestions, including visual roadmaps (mermaid.js code).
- All endpoints require a valid JWT in the `Authorization` header after OTP verification.
- For 12th pass students, `specialization` must be provided during registration and is used in quiz/career logic.



---


- **GET /colleges**
  - Headers: `Authorization: Bearer <jwt_token>`
  - Example: `/api/colleges?district=Kalaburagi&program=Computer Science & Engineering`
  - Returns: List of colleges in the district (optionally filtered by program)

- **GET /colleges/:collegeId**
  - Headers: `Authorization: Bearer <jwt_token>`
  - Example: `/api/colleges/68caba511a71f6effd8a4c23`
  - Returns: Details for a specific college

- **Response Object Structure:**
  - `_id`, `name`, `district`, `address`, `location` (`lat`, `lng`), `contact` (`phone`, `email`), `programs` (with `name`, `cutoff`, `eligibility`, `medium`, `_id`), `facilities` (e.g., hostel, lab, library, internet)

---

For any questions, contact the backend developer.

---

# Backend Documentation

This document outlines the architecture, API endpoints, and key features of the MargaDarshi backend application.

## 1. Core Architecture

The backend is a monolithic Node.js application built with the Express framework and MongoDB for data storage. It serves three primary functions:
1.  **User Management & Authentication**: Handles user registration, login, profile management, and authentication using JWT.
2.  **AI-Powered Career Guidance**: Provides a multi-step, cost-effective career guidance flow using a combination of OpenAI, Gemini, and DeepSeek models.
3.  **College Information Proxy**: Acts as a proxy to a separate, dedicated College API for fetching college information.

## 2. Environment Variables (`.env`)

The application relies on the following environment variables:

-   `MONGO_URI`: MongoDB connection string.
-   `JWT_SECRET`: Secret key for signing JWT tokens.
-   `EMAIL_USER`: Gmail account for sending OTPs.
-   `EMAIL_PASS`: Gmail app password for the email account.
-   `ADMIN_PASSWORD`: Static password for admin-level operations.
-   `OPENAI_API_KEY`: API key for OpenAI (Primary AI provider).
-   `GEMINI_API_KEY`: API key for Google Gemini (Secondary AI provider).
-   `DEEPSEEK_API_KEY`: API key for DeepSeek (Fallback AI provider).
-   `COLLEGE_API_URL`: The base URL for the external College API (e.g., `https://collegeapi-mnni.onrender.com`).

## 3. API Endpoints

All endpoints are prefixed with `/api`.

### User Authentication (`/api/auth`)

-   **`POST /register`**: Registers a new user.
-   **`POST /login`**: Initiates login by sending an OTP to the user's email.
-   **`POST /verify-otp`**: Verifies the OTP and returns a JWT token and user object.
-   **`POST /logout`**: Logs the user out. (Requires JWT)
-   **`GET /dashboard`**: Retrieves the authenticated user's profile. (Requires JWT)
-   **`PUT /profile`**: Updates the authenticated user's profile. (Requires JWT)
    -   **Body**: A JSON object with any of the following fields: `name`, `dob`, `age`, `gender`, `qualification`, `specialization`, `state`, `district`, `profilePhotoUrl`.
-   **`DELETE /admin/delete-user`**: Deletes a user by email. (Requires `adminPassword`)

### AI Career Guidance (`/api`)

This flow is designed to be efficient by splitting the AI interaction into multiple steps.

1.  **`GET /quiz`**: Fetches a personalized, AI-generated quiz based on the user's qualification. (Requires JWT)
2.  **`POST /quiz/submit`**: Submits the user's quiz answers. The backend saves these answers and returns a list of suggested career titles. This is a lightweight AI call. (Requires JWT)
3.  **`POST /career/details`**: Takes a single `career_title` from the previous step and returns a detailed, structured roadmap for that specific career. This is the main, resource-intensive AI call. (Requires JWT)

### College Information Proxy (`/api/colleges`)

This backend acts as a proxy to the external College API defined by `COLLEGE_API_URL`. It does not contain any college data or business logic itself.

-   **`GET /`**: Lists all colleges or filters them by forwarding query parameters.
    -   **Query Params**: `district` (String), `program` (String)
    -   **Example**: `/api/colleges?district=Kalaburagi&program=Engineering`
-   **`GET /suggest`**: Gets personalized college suggestions by forwarding query parameters. (Requires JWT)
    -   **Query Params**: `qualification` (String, required), `specialization` (String, optional)
    -   **Example**: `/api/colleges/suggest?qualification=12th&specialization=medical`

## 4. New Feature: Profile Photo

-   **User Model (`models/User.js`)**: A new field `profilePhotoUrl` (String) has been added to the user schema to store the URL of the user's profile picture.
-   **Update Profile Endpoint (`PUT /api/auth/profile`)**: This endpoint can now accept a `profilePhotoUrl` in the request body to save or update the user's profile photo URL.

This implementation assumes you have a separate service or frontend client responsible for uploading the image and providing the URL to this backend.
