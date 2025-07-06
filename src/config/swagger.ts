import { config } from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";

config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finimart-alx-graduation-project API Documentation",
      version: "1.0.0",
      description: "API documentation for Finimart-alx-graduation-project application",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/apis/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
