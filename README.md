# 🎉 Event Management API

A robust RESTful API for managing events, built with Node.js, Express, Prisma, and PostgreSQL. This API provides a complete solution for event management with features like authentication, authorization, and real-time updates.

## ✨ Features

- 🚀 **Full CRUD Operations**: Create, read, update, and delete events
- 📊 **Advanced Querying**: Filter, sort, and paginate events
- 🔒 **Authentication & Authorization**: JWT-based authentication (coming soon)
- ⏱️ **Rate Limiting**: Protect your API from abuse
- 📚 **Interactive Documentation**: Swagger/OpenAPI support
- 🧪 **Testing**: Comprehensive test suite with Jest and Supertest
- 🛡️ **Input Validation**: Secure data handling with express-validator
- 🗄️ **Database**: PostgreSQL with Prisma ORM for type-safe database access
- 📈 **Health Checks**: Monitor API status and database connection
- 🐳 **Docker Support**: Easy containerization and deployment
- 🔄 **Real-time Updates**: WebSocket support (coming soon)

## 🛠 Prerequisites

- Node.js (v16 or later)
- npm (v8 or later) or yarn (v1.22 or later)
- PostgreSQL (v12 or later)
- Git (for version control)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/event-management-api.git
cd event-management-api

# Install dependencies
npm install

# Install dependencies with legacy-peer-deps
npm install --legacy-peer-deps
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Update the .env file with your database credentials
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate


```

### 4. Start Development Server

```bash
# Start the development server with hot-reload
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Access API Documentation

Open your browser and navigate to:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs.json

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`

## 🛠 Available Scripts

### Development
- `npm run dev` - Start development server with hot-reload
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run docs:generate` - Generate API documentation
- `npm run docs:view` - View API documentation in a local server

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Database
- `npm run db:check` - Check database connection
- `npm run db:setup` - Set up database (migrate and seed)
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:generate` - Generate Prisma Client

### Code Quality
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase
- `npm run check` - Run linting and tests

### Production
- `npm start` - Start production server
- `npm run build` - Build the application (if using TypeScript)

## 📚 API Reference

### Events

| Method | Endpoint              | Description                       | Authentication |
|--------|----------------------|-----------------------------------|----------------|
| GET    | /api/events          | Get all events (paginated)        | Public         |
| POST   | /api/events          | Create a new event                | Protected     |
| GET    | /api/events/:id      | Get a single event by ID          | Public         |
| PUT    | /api/events/:id      | Update an existing event          | Protected     |
| DELETE | /api/events/:id      | Delete an event                   | Protected     |
| GET    | /api/health          | Check API health status           | Public         |

### Query Parameters

#### GET /api/events

| Parameter  | Type    | Required | Default | Description                          |
|------------|---------|----------|---------|--------------------------------------|
| page       | integer | No       | 1       | Page number                          |
| limit      | integer | No       | 10      | Items per page (max: 100)            |
| sortBy     | string  | No       | createdAt | Field to sort by (title, eventDate, createdAt, capacity) |
| sortOrder  | string  | No       | desc    | Sort order (asc, desc)               |
| search     | string  | No       | -       | Search query to filter events        |

### Request and Response Examples

#### Create an Event
```http
POST /api/events
Content-Type: application/json

{
  "title": "Tech Conference 2023",
  "description": "Annual technology conference",
  "eventDate": "2023-12-15T09:00:00.000Z",
  "capacity": 500
}
```

#### Successful Response (201 Created)
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Tech Conference 2023",
    "description": "Annual technology conference",
    "eventDate": "2023-12-15T09:00:00.000Z",
    "capacity": 500,
    "createdAt": "2023-06-23T10:00:00.000Z",
    "updatedAt": "2023-06-23T10:00:00.000Z"
  }
}
```

#### Get Events with Pagination
```http
GET /api/events?page=1&limit=5&sortBy=eventDate&sortOrder=asc
```

#### Successful Response (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2023",
      "description": "Annual technology conference",
      "eventDate": "2023-12-15T09:00:00.000Z",
      "capacity": 500,
      "createdAt": "2023-06-23T10:00:00.000Z",
      "updatedAt": "2023-06-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Testing

To run the test suite, first set up the test database:

```bash
# Set up test database
DATABASE_URL="postgresql://postgres:string!123@localhost:5432/event_management_api_test?schema=public" npx prisma migrate reset --force --skip-generate

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Database Schema

### Event

| Field       | Type      | Description                     |
|-------------|-----------|---------------------------------|
| id          | String    | Unique identifier (UUID)        |
| title       | String    | Event title (max 255 chars)     |
| description | String    | Event description               |
| eventDate   | DateTime  | Date and time of the event      |
| capacity    | Int       | Maximum number of participants  |
| createdAt   | DateTime  | When the event was created      |
| updatedAt   | DateTime  | When the event was last updated |

## Rate Limiting

The API is protected by rate limiting to prevent abuse. By default, clients are limited to 100 requests per 15 minutes per IP address.

## Error Handling

All error responses follow the same format:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": [
    {
      "msg": "Validation error message",
      "param": "fieldName",
      "value": "invalidValue"
    }
  ]
}
```

## Environment Variables

| Variable         | Default Value                                   | Description                          |
|------------------|------------------------------------------------|--------------------------------------|
| NODE_ENV         | development                                    | Node environment                     |
| PORT             | 3000                                           | Port the server listens on           |
| DATABASE_URL     | postgresql://...                               | PostgreSQL connection string         |
| RATE_LIMIT_WINDOW_MS | 900000 (15 minutes)                       | Rate limiting window in milliseconds |
| RATE_LIMIT_MAX   | 100                                            | Maximum requests per window          |
| JWT_SECRET       | -                                              | Secret for JWT signing (required for auth) |
| JWT_EXPIRES_IN   | 7d                                             | JWT expiration time                 |
| LOG_LEVEL        | info                                           | Logging level (error, warn, info, debug) |

## 🔐 Authentication

> **Note:** Authentication is coming soon in a future release.

The API will support JWT-based authentication. Protected routes will require a valid JWT token in the `Authorization` header.

```http
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## 🐳 Docker Support

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t event-management-api .

# Run the container
docker run -p 3000:3000 --env-file .env event-management-api
```

For development with hot-reload:

```bash
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Jest](https://jestjs.io/)
- [Swagger](https://swagger.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Deployment

### Prerequisites
- Node.js and npm installed
- PostgreSQL database
- PM2 (recommended for production)

### Steps

1. Clone the repository
2. Install dependencies: `npm install --production`
3. Set up environment variables in `.env`
4. Run database migrations: `npx prisma migrate deploy`
5. Start the server: `npm start` or using PM2: `pm2 start src/server.js --name "event-api"`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
