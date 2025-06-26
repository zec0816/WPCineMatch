import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./styles/bookmark.css"; // Import the CSS file
import MovieExplorerLogo from "./assets/MovieExplorerLogo.png";

const Bookmark = () => {
  const navigate = useNavigate();
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
      <section className="bookmark-section">
        <div className="link-container">
          <Link className="bookmark-link" to="/favourite">
            <span>❤️</span>
            My Favourites
          </Link>

          <hr className="divider" />

          <Link className="bookmark-link" to="/watchlater">
            <span>⏳</span>
            Watch Later
          </Link>
        </div>
      </section>
    </>
  );
};

export default Bookmark;
