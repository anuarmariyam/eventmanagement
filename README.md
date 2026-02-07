````md
# EventHub — Event Management Web Application

## Project Overview

EventHub is a full-stack web application for managing events such as concerts, conferences, and sports activities.  
The system allows users to register, log in, create and manage their own events, view events created by other users, and check the weather forecast for a specific event date and city.

The project uses JWT-based authentication, MongoDB for data storage, and follows a REST API architecture with proper validation and centralized error handling.

---

## Setup and Installation Instructions

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)
- OpenWeather API key

---

### Installation Steps

#### 1. Clone the repository
```bash
git clone <repository-url>
cd project-root
````

#### 2. Install dependencies

```bash
npm install
```

#### 3. Create a `.env` file in the project root

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENWEATHER_API_KEY=your_openweather_api_key
```

#### 4. Start the server

```bash
npm start
```

The application will run at:

```
http://localhost:5000
```

---

## API Documentation

### Authentication Routes (Public)

| Method | Endpoint             | Access | Description                |
| ------ | -------------------- | ------ | -------------------------- |
| POST   | `/api/auth/register` | Public | Register a new user        |
| POST   | `/api/auth/login`    | Public | Login user and receive JWT |

---

### User Routes (Private)

| Method | Endpoint             | Access  | Description                    |
| ------ | -------------------- | ------- | ------------------------------ |
| GET    | `/api/users/profile` | Private | Get authenticated user profile |
| PUT    | `/api/users/profile` | Private | Update user profile data       |

---

### Event Routes (Private)

| Method | Endpoint                  | Access  | Description                        |
| ------ | ------------------------- | ------- | ---------------------------------- |
| GET    | `/api/events`             | Private | Get all events                     |
| GET    | `/api/events/my`          | Private | Get events created by the user     |
| GET    | `/api/events/:id`         | Private | Get a specific event by ID         |
| POST   | `/api/events`             | Private | Create a new event                 |
| PUT    | `/api/events/:id`         | Private | Update an existing event           |
| DELETE | `/api/events/:id`         | Private | Delete an event                    |
| GET    | `/api/events/:id/weather` | Private | Get weather forecast for the event |

---

### Authorization

All private routes require a valid JWT token sent in the request headers:

```
Authorization: Bearer <token>
```

---

## Validation & Error Handling

* Incoming data is validated using middleware and the validator library
* Meaningful HTTP status codes are returned:

  * 400 — Bad Request
  * 401 — Unauthorized
  * 403 — Forbidden
  * 404 — Not Found
* A global error-handling middleware is used to catch and handle unexpected server errors

---
```