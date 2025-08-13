import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Treaty</h1>
      <p>Your platform for seamless seals of approval.</p>
      <p>
        <Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link> to
        get started.
      </p>
    </div>
  );
}

export default HomePage;
