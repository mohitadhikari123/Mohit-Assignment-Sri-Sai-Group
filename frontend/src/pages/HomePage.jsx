import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {

  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Welcome to Taskify!</h1>
      <p className="homepage-subtitle">Your ultimate task management solution.</p>
    </div>
  );
};

export default HomePage;