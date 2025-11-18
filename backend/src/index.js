const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const { initDb } = require('./database/db');
const authRoutes = require('./routes/auth');
const crackRoutes = require('./routes/crack');

// Prevent unhandled rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - just log the error
});

// Prevent uncaught exceptions from crashing the process immediately
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - just log the error
});

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

app.use('/api/auth', authRoutes);
app.use('/api/crack', crackRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
  });
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initDbWithRetry = async () => {
  let attempt = 1;
  while (true) {
    try {
      await initDb();
      if (attempt > 1) {
        console.log('Database connection re-established');
      }
      return;
    } catch (error) {
      console.error(
        `Database initialization failed (attempt ${attempt}):`,
        error.message
      );
      attempt += 1;
      console.log(
        `Retrying in ${config.server.startupRetryDelayMs}ms...`
      );
      await delay(config.server.startupRetryDelayMs);
    }
  }
};

let server = null;

// Graceful shutdown handler
const shutdown = async () => {
  if (server) {
    console.log('Shutting down server...');
    return new Promise((resolve) => {
      server.close(() => {
        console.log('Server closed');
        server = null;
        resolve();
      });
    });
  }
};

// Handle nodemon restart and other termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
  try {
    await initDbWithRetry();
    
    // Close existing server if any (shouldn't happen, but just in case)
    if (server) {
      await shutdown();
    }
    
    // Start server with retry logic for EADDRINUSE
    let retries = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second
    
    while (retries < maxRetries) {
      try {
        server = app.listen(config.port, () => {
          console.log(`Backend listening on port ${config.port}`);
        });

        // Handle server errors
        server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`Port ${config.port} is already in use. Retrying in ${retryDelay}ms...`);
            server = null;
            setTimeout(() => {
              start().catch((err) => {
                console.error('Failed to restart after EADDRINUSE:', err);
              });
            }, retryDelay);
          } else {
            console.error('Server error:', error);
          }
        });
        
        // Successfully started
        break;
      } catch (error) {
        if (error.code === 'EADDRINUSE') {
          retries++;
          if (retries < maxRetries) {
            console.log(`Port ${config.port} busy, retrying in ${retryDelay}ms... (${retries}/${maxRetries})`);
            await delay(retryDelay);
          } else {
            console.error(`Failed to start server after ${maxRetries} attempts. Port ${config.port} is still in use.`);
            console.error('Please make sure no other process is using this port.');
          }
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error during startup', error);
    setTimeout(() => {
      start().catch((err) => {
        console.error('Failed to restart:', err);
      });
    }, config.server.startupRetryDelayMs);
  }
};

// Start the server
start().catch((error) => {
  console.error('Initial startup failed:', error);
  setTimeout(() => {
    start().catch((err) => {
      console.error('Failed to restart:', err);
    });
  }, config.server.startupRetryDelayMs);
});


