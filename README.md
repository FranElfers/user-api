# user-api
REST API for user config and admin CRUD
This project is a Node.js/TypeScript API with JWT-based authentication, dockerized together with MongoDB and mongo-express.

## Set up the project

1. Copy the .env.template file to .env
```cp .env.template .env```
2. Edit the .env with your own values.
3. Start the containers with Docker Compose:
```docker-compose up -d```

## Create first admin user
On the first run, the database will be empty. To create the initial admin user:

1. Enter the API container:
```docker exec -it user-api sh```
2. Run the seed script - WARNING. This script clears the users collection.:
```npm run seed```
3. the script will output a JWT token for the admin user. Copy this token and use it in your API requests as the Authorization header.

