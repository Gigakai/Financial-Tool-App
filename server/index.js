import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import UserRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI || '';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', UserRouter);

// MongoDB connection
mongoose.connect(DB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});