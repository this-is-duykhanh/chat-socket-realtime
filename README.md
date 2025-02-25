# Real-Time Chat Application

This is a web-based real-time chat application built using **Node.js**, **Express.js**, **Socket.io**, and **Redis** for real-time communication. It also integrates **MongoDB** for data storage and uses **Next.js** for the frontend.

## Features
- Real-time messaging using **Socket.io**
- User authentication
- Message persistence using **MongoDB**
- Redis for caching and improving performance
- Dockerized setup for easy deployment

## Prerequisites
Before running the project, ensure you have the following installed:
- **Node.js** (v20+)
- **Docker & Docker Compose**

## Installation & Setup

### Running Locally
1. **Clone the repository:**
   ```sh
   git clone https://github.com/this-is-duykhanh/chat-socket-realtime.git
   cd chat-socket-realtime
   ```

2. **Backend Setup**
   ```sh
   cd server
   npm install
   npm run start
   ```

3. **Frontend Setup**
   ```sh
   cd www
   npm install
   npm run dev
   ```

4. **Start Redis and MongoDB (if not using Docker):**
   ```sh
   docker run -d --name redis -p 6379:6379 redis
   docker run -d --name mongo -p 27017:27017 mongo
   ```

5. Open the app in your browser at `http://localhost:3000`

### Running with Docker
1. **Build and start the containers:**
   ```sh
   docker-compose up --build
   ```

2. The services will be available at:
   - **Frontend:** `http://localhost:3000`
   - **Backend:** `http://localhost:8080`
   - **MongoDB:** `mongodb://mongo:27017/chatdb`
   - **Redis:** `redis://redis:6379`

## Environment Variables
Create a `.env` file in the `server` and `www` directories with the following:

### Server (.env)
```
DB_URL=mongodb://mongo:27017/chatdb
REDIS_HOST=localhost
REDIS_PORT=6379
HOST_NAME=0.0.0.0
PORT=8080
```

### Client (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Troubleshooting
- **Redis Connection Error:** Ensure Redis is running (`docker ps` or `docker-compose up redis`).
- **MongoDB Connection Issue:** Verify MongoDB is running (`docker ps` or `docker-compose up mongo`).
- **Port Conflicts:** Make sure no other services are running on the specified ports.

## License
This project is licensed under the MIT License.

---
Feel free to modify as needed! 🚀

"# chat-socket-realtime" 
