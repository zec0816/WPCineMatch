import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  fetchMovies,
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "./api.js";

// Styled Components
const StyledInput = styled.input`
  padding: 12px;
  border-radius: 30px;
  width: 100%;
  background-color: #141414;
  color: #fff;
  border: 1px solid #444;
  font-size: 1rem;
  &::placeholder {
    color: #aaa;
  }
`;

const StyledSelect = styled.select`
  padding: 12px;
  border-radius: 30px;
  background-color: #141414;
  color: #fff;
  border: 1px solid #444;
  font-size: 1rem;
`;

const MovieCard = styled.div`
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease;
  background-color: #141414;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    transform: scale(1.08);
  }
`;

const MoviePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
`;

const MovieTitleOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(
    to top,
    rgba(20, 20, 20, 0.9),
    rgba(20, 20, 20, 0)
  );
  color: white;
  font-weight: bold;
  font-size: 1rem;
`;

const MovieWrapper = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
`;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");

  useEffect(() => {
    fetchMovies(query, genre, year, sortBy).then(setMovies);
  }, [query, genre, year, sortBy]);

  async function showMovieDetails(movieId) {
    // Fetch movie details and trailer
    const movie = await fetchMovieDetails(movieId);
    const trailer = await fetchMovieTrailer(movieId);

    // Set state with the movie and trailer information
    setSelectedMovie(movie);
    setTrailerKey(trailer || "");
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-black border-bottom border-secondary">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
            🎬 MovieExplorer
          </a>
        </div>
      </nav>

      {/* Filters */}
      <div className="container my-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-6">
            <StyledInput
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-md-6 d-flex gap-2">
            <StyledSelect
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Genre</option>
              <option value="28">Action</option>
              <option value="35">Comedy</option>
              <option value="18">Drama</option>
            </StyledSelect>
            <StyledSelect
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Year</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </StyledSelect>
            <StyledSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="popularity.desc">Popularity</option>
              <option value="vote_average.desc">Rating</option>
              <option value="release_date.desc">Release Date</option>
            </StyledSelect>
          </div>
        </div>
      </div>

      {/* Movie Results */}
      <div className="container">
        <div className="row g-4">
          {movies.length === 0 ? (
            <p className="text-white">No movies found.</p>
          ) : (
            movies.map((movie) => {
              const posterUrl = movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "https://via.placeholder.com/300x400?text=No+Image";
              return (
                <div key={movie.id} className="col-6 col-sm-4 col-md-3">
                  <MovieCard onClick={() => showMovieDetails(movie.id)}>
                    <MovieWrapper>
                      <MoviePoster src={posterUrl} alt={movie.title} />
                      <MovieTitleOverlay>{movie.title}</MovieTitleOverlay>
                    </MovieWrapper>
                  </MovieCard>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedMovie && (
        <div
          className="modal fade show"
          id="movieModal"
          tabIndex="-1"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setSelectedMovie(null)} // Reset the modal
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
