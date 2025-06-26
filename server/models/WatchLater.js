const mongoose = require("mongoose");

const WatchLaterSchema = new mongoose.Schema({
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
}, { collection: 'WatchLaterMovie' }); // <-- specify collection name here

WatchLaterSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // prevent duplicate

module.exports = mongoose.model("WatchLaterMovie", WatchLaterSchema); //model