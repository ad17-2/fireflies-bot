import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import basicAuth from "express-basic-auth";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API with Auth",
      version: "1.0.0",
      description: "A simple Express API with JWT Authentication",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["**/routes/api/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const swaggerSetup = (app: any) => {
  app.use(
    "/api-docs",
    basicAuth({
      users: { admin: process.env.SWAGGER_PASSWORD },
      challenge: true,
      realm: "Swagger UI",
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
};

export default swaggerSpec;
