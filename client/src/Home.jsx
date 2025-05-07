import Navbar from "./Navbar";
import React, { useEffect, useState } from "react";
import {
  fetchMoviesByGenre,
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";
import "./styles/home.js";
import { useNavigate } from "react-router-dom";

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
];

const Home = () => {
  const [genreMovies, setGenreMovies] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null); // To store selected movie
  const [trailerKey, setTrailerKey] = useState(""); // To store trailer key
  const navigate = useNavigate();

  useEffect(() => {
    const loadAllGenres = async () => {
      const all = {};
      for (let genre of genres) {
        all[genre.name] = await fetchMoviesByGenre(genre.id);
      }
      setGenreMovies(all);
    };
    loadAllGenres();
  }, []);

  async function showMovieDetails(movieId) {
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);
    setSelectedMovie(movie); // Set the selected movie details
    setTrailerKey(trailer || "");
  }

  const featuredMovie = genreMovies["Action"]?.[0]; // Featured movie for the banner

  return (
    <>
      <Navbar className="navbar navbar-dark bg-black border-bottom border-secondary px-3">
        <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
          🎬 MovieExplorer
        </a>
        <button
          className="btn btn-outline-light ms-auto"
          onClick={() => navigate("/search")}
        >
          🔍 Search
        </button>
      </Navbar>

      {/* Hero Banner */}
      {featuredMovie && (
        <div
          className="hero-banner"
          style={{
            backgroundImage: `url(${IMAGE_BASE_URL}${featuredMovie.backdrop_path})`,
          }}
        >
          <div className="hero-overlay">
            <h2 className="hero-title">{featuredMovie.title}</h2>
            <p className="hero-rank">🔥 Trending Now</p>
            <p className="hero-description">{featuredMovie.overview}</p>
            <div className="hero-buttons">
              <button
                className="hero-btn play"
                onClick={() => showMovieDetails(featuredMovie.id)}
              >
                ▶ Play
              </button>
              <button
                className="hero-btn info"
                onClick={() => showMovieDetails(featuredMovie.id)}
              >
                ℹ More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movie List */}
      <div className="container mt-5">
        {Object.entries(genreMovies).map(([genre, movies]) => (
          <div key={genre} className="mb-4">
            <h3 className="text-white mb-3">{genre} Movies</h3>
            <div className="movie-row">
              {movies.map((movie) => (
                <img
                  key={movie.id}
                  className="movie-thumbnail"
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  alt={movie.title}
                  onClick={() => showMovieDetails(movie.id)} // Display movie details on click
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedMovie(null)} // Close modal
                ></button>
              </div>
              <div className="modal-body d-flex flex-column flex-md-row gap-3">
                <img
                  src={
                    selectedMovie.poster_path
                      ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                      : "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  className="img-fluid"
                  style={{ maxWidth: "300px", borderRadius: "8px" }}
                  alt="Movie Poster"
                />
                <div>
                  <p>{selectedMovie.overview}</p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}
                  </p>
                  <div className="mt-3">
                    {trailerKey ? (
                      <iframe
                        width="100%"
                        height="300"
                        src={`https://www.youtube.com/embed/${trailerKey}`}
                        frameBorder="0"
                        allowFullScreen
                        title="Trailer"
                      ></iframe>
                    ) : (
                      <p>No trailer available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
