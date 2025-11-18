import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import classRoutes from './routes/classes.js';
import instructorRoutes from './routes/instructors.js';
import locationRoutes from './routes/locations.js';
import courseRoutes from './routes/courses.js';
import reportRoutes from './routes/reports.js';
import publicRoutes from './routes/public.js';
import schoolRoutes from './routes/schools.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/classes', classRoutes);
app.use('/instructors', instructorRoutes);
app.use('/locations', locationRoutes);
app.use('/courses', courseRoutes);
app.use('/reports', reportRoutes);
app.use('/public', publicRoutes);
app.use('/schools', schoolRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

