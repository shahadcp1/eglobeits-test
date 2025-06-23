const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../src/config/config');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Event Management API',
    version: '1.0.0',
    description: 'API documentation for Event Management System',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.join(__dirname, '../src/routes/*.js'),
    path.join(__dirname, '../src/models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Write the swagger spec to a file
const outputFile = path.join(__dirname, '../docs/swagger.json');
const outputDir = path.dirname(outputFile);

// Create the docs directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the file
fs.writeFileSync(outputFile, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ API documentation generated at: ${outputFile}`);
