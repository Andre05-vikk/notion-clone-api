# Task Manager Frontend

This is a React frontend application for the Task Manager API. It provides a user interface for managing tasks, user accounts, and authentication.

## Features

- User authentication (login, register, logout)
- Task management (create, read, update, delete)
- User profile management (update password, delete account)
- View all users
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (default: http://localhost:5001)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

## Configuration

The application is configured to connect to the backend API at `http://localhost:5001` by default. You can change this by:

1. Creating a `.env` file in the frontend directory
2. Adding the following line:
   ```
   REACT_APP_API_URL=your_api_url
   ```

## Running the Application

To start the development server:

```
npm start
```
or
```
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```
npm run build
```
or
```
yarn build
```

The build files will be created in the `build` directory.

## API Endpoints

The frontend interacts with the following backend API endpoints:

### Authentication
- `POST /sessions` - Login
- `DELETE /sessions` - Logout

### Users
- `POST /users` - Register a new user
- `GET /users` - Get all users
- `GET /users/:userId` - Get user by ID
- `PATCH /users/:userId` - Update user password
- `DELETE /users/:userId` - Delete user account

### Tasks
- `GET /tasks` - Get all tasks with pagination and filtering
- `POST /tasks` - Create a new task
- `PATCH /tasks/:taskId` - Update a task
- `DELETE /tasks/:taskId` - Delete a task

## Technologies Used

- React
- TypeScript
- React Router
- Axios
- CSS (custom styling)

## License

This project is licensed under the MIT License.
