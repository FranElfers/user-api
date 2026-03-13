import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User API",
      version: "1.0.0",
      description: "API documentation for User API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      servers: [
        { url: `http://localhost:${process.env.PORT}` }
      ],
      schemas:{
        getUser: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "MongoDB ObjectId of the user",
            },
            name: {
              type: "string",
            },
            cuit: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
            },
            isAdmin: {
              type: "boolean",
            },
            config: {
              type: "object",
              default: {}
            }
          }
        },
        postUser:{
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            cuit: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            status: {
              type: "string",
              enum: ["active", "inactive"],
            },
            isAdmin: {
              type: "boolean",
            },
            config: {
              type: "object",
              default: {}
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"]
};

  const specs = swaggerJsdoc(options);

  export function setupSwagger(app: Express) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}
