// WatchLaterList.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { fetchMovieDetails, fetchMovieTrailer, IMAGE_BASE_URL } from "./api.js";
import { API_BASE_URL } from "./config";
import WatchLaterButton from "./components/WatchLaterButton";
import HeartButton from "./components/HeartButton";
import "./styles/watchlaterlist.css"; 

const WatchLaterList = () => {
  const [watchLater, setWatchLater] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [groupedMovies, setGroupedMovies] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [favouriteMovieIds, setFavouriteIds] = useState([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavourite = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Favourite list.");
        return;
      }

      const isAdded = favouriteMovieIds.includes(movie.id);

      if (isAdded) {
        const response = await fetch(
          `${API_BASE_URL}/api/favourite/${movie.id}?userId=${userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to remove movie");
        const updated = favouriteMovieIds.filter((id) => id !== movie.id);
        setFavouriteIds(updated);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/favourite/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
          }),
        });

        if (!response.ok) throw new Error("Failed to add movie");
        const updated = [...favouriteMovieIds, movie.id];
        setFavouriteIds(updated);
      }
    } catch (err) {
      console.error("Favourite toggle error:", err);
      alert("Connection error. Please check your network and try again.");
    }
  };

  const toggleWatchLater = async (movie, event) => {
    event.stopPropagation();
    try {
      const userId = localStorage.getItem("userEmail");
      if (!userId) {
        alert("Please log in to modify Watch Later list.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/watchlater/${movie.id}?userId=${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to remove movie");
      setWatchLater((prev) => prev.filter((m) => m.id !== movie.id));
      setGroupedMovies(
        groupByGenre(watchLater.filter((m) => m.id !== movie.id))
      );
      setSelectedMovie(null);
    } catch (error) {
      console.error("Error removing watch later:", error);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = localStorage.getItem("userEmail");
      if (!userId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/favourite/list/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const data = await response.json();
        const ids = data.map((fav) => fav.movieId);
        setFavouriteIds(ids);
      } catch (error) {
        console.error("Fetch favorites error:", error);
      }
    };
    fetchFavorites();
  }, [email]);

  const groupByGenre = (movies) => {
    const grouped = {};
    movies.forEach((movie) => {
      if (Array.isArray(movie.genres) && movie.genres.length > 0) {
        movie.genres.forEach((genre) => {
          const genreName = genre.name;
          if (!grouped[genreName]) grouped[genreName] = [];
          grouped[genreName].push(movie);
        });
      } else {
        if (!grouped["No Genre"]) grouped["No Genre"] = [];
        grouped["No Genre"].push(movie);
      }
    });

    // Sort genres alphabetically
    const sortedGenres = Object.keys(grouped).sort((a, b) =>
      a.localeCompare(b)
    );
    const sortedGrouped = {};
    sortedGenres.forEach((genre) => {
      sortedGrouped[genre] = grouped[genre];
    });

    return sortedGrouped;
  };

  const fetchWatchLaterMovies = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/watchlater/list/${email}`
      );
      if (!response.ok) throw new Error("Failed to fetch watch later");

      const watchLaterData = await response.json();

      const moviesWithDetails = await Promise.all(
        watchLaterData.map(async (item) => {
          const details = await fetchMovieDetails(item.movieId);
          return {
            ...item,
            ...details,
            genres: details.genres || [],
          };
        })
      );

      setWatchLater(moviesWithDetails);
      setGroupedMovies(groupByGenre(moviesWithDetails));
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to load Watch Later movies.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchLaterMovies();
  }, [email]);

  const handleRemoveWatchLater = async (movieId) => {
    if (!email) {
      alert("You must be logged in to modify Watch Later list.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/watchlater/${movieId}?userId=${email}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to remove movie");

      setWatchLater((prev) => prev.filter((movie) => movie.id !== movieId));
      setGroupedMovies(
        groupByGenre(watchLater.filter((movie) => movie.id !== movieId))
      );
    } catch (error) {
      console.error("Error removing watch later:", error);
    }
  };

  const searchInWatchlist = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setGroupedMovies(groupByGenre(watchLater));
      return;
    }

    const filteredMovies = watchLater.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );

    setGroupedMovies(groupByGenre(filteredMovies));
  };

  const sortWatchlist = async (userId, sortBy) => {
    if (!userId) {
      alert("You must be logged in to sort your watchlist.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/watchlater/list/${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch watch later");

      let watchLaterData = await response.json();
      const moviesWithDetails = await Promise.all(
        watchLaterData.map(async (item) => {
          const details = await fetchMovieDetails(item.movieId);
          return {
            ...item,
            ...details,
            genres: details.genres || [],
          };
        })
      );

      let sortedMovies = [...moviesWithDetails];
      switch (sortBy) {
        case "rating":
          sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
          break;
        case "releaseDate":
          sortedMovies.sort(
            (a, b) => new Date(b.release_date) - new Date(a.release_date)
          );
          break;
        case "title":
          sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          break;
      }

      setWatchLater(sortedMovies);
      setGroupedMovies(groupByGenre(sortedMovies));
    } catch (error) {
      console.error("Sorting error:", error);
      alert("Failed to sort watchlist.");
    } finally {
      setIsLoading(false);
    }
  };

  async function showMovieDetails(movieId) {
    try {
      const movie = await fetchMovieDetails(movieId);
      const trailer = await fetchMovieTrailer(movieId);
      setSelectedMovie(movie);
      setTrailerKey(trailer || "");
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }
  const [currentSort, setCurrentSort] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      applySort(currentSort, watchLater);
      return;
    }
    const filteredMovies = watchLater.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );

    applySort(currentSort, filteredMovies);
  };

  const applySort = (sortBy, moviesToSort = watchLater) => {
    setCurrentSort(sortBy);

    let sortedMovies = [...moviesToSort];

    switch (sortBy) {
      case "rating":
        sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case "releaseDate":
        sortedMovies.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );
        break;
      case "title":
        sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    // When sorting is active, include both sorted and grouped movies
    if (sortBy) {
      setGroupedMovies({
        "All Movies": sortedMovies, // Top section: sorted movies
        ...groupByGenre(moviesToSort), // Bottom section: grouped by genre
      });
    } else {
      // Default: only grouped by genre
      setGroupedMovies(groupByGenre(moviesToSort));
    }
  };

  const handleSort = (sortBy) => {
    const moviesToSort = searchQuery
      ? watchLater.filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...watchLater];

    applySort(sortBy, moviesToSort);
  };

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

      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center text-white mb-4 fw-bold watchlist-title">
              ⌛ Watch Later
            </h1>
          </div>
        </div>
      </div>

      <div className="container mb-4 bg-black rounded p-4 search-container">
        <div className="row justify-content-center">
          <div className="col-md-7 d-flex justify-content-center mb-2">
            <div className="input-group w-100">
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Search in your watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSearch(searchQuery)
                }
              />
              <button
                className="btn btn-outline-danger"
                onClick={() => handleSearch(searchQuery)}
              >
                Search
              </button>
            </div>
          </div>
          <div className="col-md-2 d-flex mb-2">
            <select
              className="form-select bg-dark text-white border-secondary"
              value={currentSort}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="">Sort by...</option>
              <option value="rating">Rating</option>
              <option value="releaseDate">Release Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mt-5 movies-container">
        {isLoading && <p className="text-white text-center">Loading...</p>}
        {watchLater.length === 0 ? (
          <p className="text-white text-center empty-message">
            Your watch later list is empty
          </p>
        ) : (
          Object.entries(groupedMovies).map(([groupName, movies]) => (
            <div className="genre-group" key={groupName}>
              <h3 className="text-white mb-3 genre-title">
                {groupName.includes("") ? (
                  <span style={{ color: "#ffffff" }}>{groupName}</span>
                ) : (
                  groupName
                )}
              </h3>
              <div className="movie-row d-flex flex-wrap">
                {movies.map((movie) => (
                  <div className="movie-container mb-4 mx-2" key={movie.id}>
                    <div className="movie-card" onClick={() => showMovieDetails(movie.id)}>
                      <img
                        className="movie-poster"
                        src={
                          movie.poster_path
                            ? `${IMAGE_BASE_URL}${movie.poster_path}`
                            : "https://via.placeholder.com/300x400?text=No+Image"
                        }
                        alt={movie.title}
                      />
                      <div className="movie-title-overlay">{movie.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setSelectedMovie(null)}
            >
              ✖
            </button>
            <div className="modal-body">
              <div className="poster-section">
                <div className="poster-wrapper">
                  <img
                    className="modal-poster"
                    src={
                      selectedMovie.poster_path
                        ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                        : "https://via.placeholder.com/300x400?text=No+Image"
                    }
                    alt={selectedMovie.title}
                  />
                  <div className="top-buttons-wrapper">
                    <HeartButton
                      $isAdded={favouriteMovieIds.includes(selectedMovie.id)}
                      onClick={(e) => toggleFavourite(selectedMovie, e)}
                      title={
                        favouriteMovieIds.includes(selectedMovie.id)
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                    >
                      {favouriteMovieIds.includes(selectedMovie.id)
                        ? "❤️"
                        : "🤍"}
                    </HeartButton>
                    <WatchLaterButton
                      $isAdded={watchLater.some(
                        (item) => item.id === selectedMovie.id
                      )}
                      onClick={(e) => toggleWatchLater(selectedMovie, e)}
                      title={
                        watchLater.some((item) => item.id === selectedMovie.id)
                          ? "Remove from Watch Later"
                          : "Add to Watch Later"
                      }
                      style={{ marginTop: "8px" }}
                    >
                      {watchLater.some((item) => item.id === selectedMovie.id)
                        ? "★"
                        : "☆"}
                    </WatchLaterButton>
                  </div>
                </div>
              </div>
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                <p>{selectedMovie.overview}</p>
                <div className="movie-details-grid">
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.release_date}
                  </p>
                  <p>
                    <strong>Rating:</strong> {selectedMovie.vote_average}/10
                  </p>
                  <p>
                    <strong>Runtime:</strong> {selectedMovie.runtime} mins
                  </p>
                  <p>
                    <strong>Genres:</strong>{" "}
                    {selectedMovie.genres?.map((g) => g.name).join(", ") ||
                      "N/A"}
                  </p>
                </div>
                {trailerKey ? (
                  <div className="trailer">
                    <iframe
                      width="100%"
                      height="300"
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      frameBorder="0"
                      allowFullScreen
                      title="Trailer"
                    />
                  </div>
                ) : (
                  <p>No trailer available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WatchLaterList;