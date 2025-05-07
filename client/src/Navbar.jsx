import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChartBar, FaBookmark, FaUserCircle } from "react-icons/fa";
import "./styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = () => {
    if (searchInput.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h2 className="nav-brand" onClick={() => navigate("/home")}>
          🎬 MovieExplorer
        </h2>
      </div>

      <div className="nav-center">
        <div className="search-box">
          <FaSearch className="search-icon" onClick={handleSearchSubmit} />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="nav-right">
        <FaChartBar
          className="nav-icon"
          title="Trending"
          onClick={() => navigate("/trending")}
        />
        <FaBookmark
          className="nav-icon"
          title="Watchlist"
          onClick={() => navigate("/watchlist")}
        />
        <FaUserCircle
          className="nav-icon profile-icon"
          title="Profile"
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
};

export default Navbar;
