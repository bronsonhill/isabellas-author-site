import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { app } from "./firebase";
import './App.css';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Blogs from './pages/Blogs';
import Footer from './components/Footer';
import Header from './components/Header';

const App = () => {
  return (
    <div className="app">
      <Router>
        <div className="app-content">
          <Header />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/works" element={<Portfolio />} />
            <Route path="/blogs" element={<Blogs />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </div>
  );
};

export default App;