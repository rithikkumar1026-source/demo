const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { pool, testConnection } = require('./config/db');
const initDb = require('./config/initDb');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Needed on Render/Railway so secure cookies work behind their proxy
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5500')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

      if (process.env.NODE_ENV !== 'production') {
        try {
          const { protocol, hostname } = new URL(origin);
          if (protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
            return callback(null, true);
          }
        } catch {
          return callback(new Error('Not allowed by CORS'));
        }
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // required for cookies
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Server is running'));

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', database: 'connected', time: result.rows[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'not connected', message: err.message });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));

const start = async () => {
  const connected = await testConnection();
  if (!connected) process.exit(1);

  await initDb();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();