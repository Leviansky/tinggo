require('express-async-errors'); // Must be at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middlewares/errorHandler');

// Fail Fast: Ensure JWT_SECRET is present
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { code: 429, status: false, message: 'Terlalu banyak permintaan, coba lagi nanti', data: null }
});

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Swagger Custom Options for Auto-Token Injection
const swaggerOptions = {
    customJsStr: `
      console.log('Swagger custom JS initialized');
      const checkUi = setInterval(() => {
        if (window.ui) {
          clearInterval(checkUi);
          const originalFetch = window.fetch;
          window.fetch = async function(...args) {
            const response = await originalFetch.apply(this, args);
            // Hanya intercept jika request ke endpoint login
            if (args[0] && args[0].includes('/auth/login')) {
              const clone = response.clone();
              clone.json().then(data => {
                if (data && data.data && data.data.token) {
                  const token = data.data.token;
                  window.ui.authActions.authorize({
                    bearerAuth: {
                      name: "bearerAuth",
                      schema: {
                        type: "http",
                        in: "header",
                        name: "Authorization",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                      },
                      value: token
                    }
                  });
                  console.log('Token otomatis disetel di Swagger UI');
                }
              }).catch(e => console.error('Error auto-setting token:', e));
            }
            return response;
          };
        }
      }, 100);
    `
};

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Default Route
app.get('/', (req, res) => {
    res.send('Task Management API is running. Go to /api-docs for documentation.');
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;
