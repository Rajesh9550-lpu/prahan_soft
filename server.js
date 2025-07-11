import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}).catch(err => console.error(err));