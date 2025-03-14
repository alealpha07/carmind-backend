# Carmind Backend
Carmind Backend is an open-source backend system for managing automotive-related data and send push notifications. Built with **Node.js**, **TypeScript**, and **Prisma**, it provides a robust foundation for scalable applications.

## Features
- **Prisma ORM** for database management
- **Docker support** for seamless deployment
- **TypeScript** for type safety and maintainability
- **Web Push Notifications** for real-time updates
- **Environment Configuration** for flexible setups

---

## Getting Started
### Prerequisites
Ensure you have the following installed on your system:

- **Node.js v20.x.x** (Latest LTS recommended)
- **npm** (comes with Node.js)
- **Docker** (for production setup, optional for development)
- **ts-node-dev** (for running TypeScript in development)

### Installation
Clone the repository and install dependencies:

```sh
# Clone the repository
git clone https://github.com/alealpha07/carmind-backend.git
cd carmind-backend

# Install dependencies
npm install
```

### Configuration
Copy the example environment file and configure necessary variables:

```sh
cp example.env .env
```

- Generate **VAPID keys** for push notifications:
  ```sh
  npx web-push generate-vapid-keys
  ```
  - _It's possible to use any other vapid key generator_
- Update `.env` with the generated VAPID keys and other required values.

### Database Setup
Run the Prisma migrations to set up the database schema:

```sh
npx prisma migrate dev
```

Generate Prisma client:

```sh
npx prisma generate
```

### Development Mode
Start the development server with hot-reloading:

```sh
npm run dev
```

---

## Production Setup (Docker)
### Prerequisites
- **Docker** and **Docker Compose** installed

### Deployment
1. Copy the example Docker Compose file and adjust configurations as needed:
   ```sh
   cp example.docker-compose.yml docker-compose.yml
   ```
2. Build and run the container:
   ```sh
   docker compose up --build
   ```

---

## Contributing
We welcome contributions from the community! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

---

## Authors
- **Alessandro Prati**
- **Armando Scuotto**
