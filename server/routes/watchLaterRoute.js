const express = require("express");
const WatchLater = require("../models/WatchLater");
const router = express.Router();

// Add movie to watch later
router.post("/add", async (req, res) => {
  const { userId, movieId, title, poster_path } = req.body;

  try {
    // Check if movie already exists in user's watch later
    const existing = await WatchLater.findOne({ userId, movieId });
    if (existing) {
      return res.status(200).json({ message: "Already in watch later" });
    }

    // Create new watch later entry
    const newWatchLater = new WatchLater({
      userId,
      movieId,
      title,
      poster_path
    });

    await newWatchLater.save();
    res.status(201).json(newWatchLater);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all watch later for a user
router.get("/list/:userId", async (req, res) => {
  try {
    const watchLater = await WatchLater.find({ userId: req.params.userId });
    res.status(200).json(watchLater);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:movieId", async (req, res) => {
  const { userId } = req.query;
  const movieId = parseInt(req.params.movieId, 10);

    // Input validation
  if (!userId || isNaN(movieId)) {
    return res.status(400).json({ message: "Missing or invalid userId/movieId" });
  }

  try {
    const deletedItem = await WatchLater.findOneAndDelete({ userId, movieId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Watch later item not found" });
    }
    res.status(200).json({ message: "Removed from watch later" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;