import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes';
import { initializeDatabase } from './initDb';
import { isDbConfigured } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API router
app.use('/api', apiRouter);

// Auto-initialize Neon database if configured
if (isDbConfigured) {
  initializeDatabase(false).then((res) => {
    if (res.success) {
      console.log('âœ… Neon Database ready and verified.');
    } else {
      console.warn('âš ï¸ Neon Database initialization warning:', res.message);
    }
  });
} else {
  console.log('â„¹ï¸ DATABASE_URL belum diatur di .env. Aplikasi akan beroperasi dalam mode local fallback.');
}

app.listen(PORT, () => {
  console.log(`ðŸš€ Backend API server running on http://localhost:${PORT}`);
});

export default app;
