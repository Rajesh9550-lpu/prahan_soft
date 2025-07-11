import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';

import Movie from '../models/Movie.js';
import { verifyToken, authorizeRole } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
};

router.post('/', verifyToken, authorizeRole(['admin']), async (req, res) => {
  const { name, rating, genres, watchedUsers } = req.body;
  const movie = new Movie({ name, rating, genres, watchedUsers });
  await movie.save();
  res.json(movie);
});

router.post('/bulk-upload', verifyToken, authorizeRole(['admin']), upload.single('file'), async (req, res) => {
  const rows = parseExcel(req.file.buffer).map(movie => ({
    ...movie,
    genres: typeof movie.genres === 'string' ? movie.genres.split(',') : [],
    watchedUsers: typeof movie.watchedUsers === 'string' ? movie.watchedUsers.split(',') : []
  }));
  const result = await Movie.insertMany(rows);
  res.json(result);
});

router.get('/', verifyToken, async (req, res) => {
  const { genre, rating, page = 1, limit = 10 } = req.query;
  const query = {};
  if (genre) query.genres = genre;
  if (rating) query.rating = { $gte: Number(rating) };

  const total = await Movie.countDocuments(query);
  const movies = await Movie.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ total, page: Number(page), limit: Number(limit), data: movies });
});

export default router;