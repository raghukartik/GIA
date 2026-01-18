import dotenv from 'dotenv';
dotenv.config();
import swaggerJSDoc from "swagger-jsdoc";
const PORT = process.env.PORT || 3000;
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant Booking & Pricing API",
      version: "1.0.0",
      description: "API documentation for restaurants, items, pricing, tax, and booking"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local server"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
