import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Social Media Share Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      user: {
        type: 'object',
        required: ['firstName', 'email'],
        properties: {
          firstName: { type: String },
          email: { type: String },
        },
      },
    },
  },
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};
export default swaggerJSDoc(swaggerOptions);
