const mongoose = require("mongoose");

const FavouriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  title: String,
  poster_path: String,
}, { collection: 'FavouriteMovie' }); // <-- specify collection name here

FavouriteSchema.index({ userId: 1, movieId: 1 }, { unique: true }); //A user cannot favorite the same movie multiple times

module.exports = mongoose.model("FavouriteMovie", FavouriteSchema); //This model provides the interface for all CRUD operations