import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  genres: [String],
  watchedUsers: [String],
});

export default mongoose.model('Movie', movieSchema);
