import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { app } from "./firebase";
import './App.css';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Blogs from './pages/Blogs';
import Layout from './components/Layout';

const App = () => {
  return (
    <div className="app">
      <Router>
        <Layout>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/works" element={<Portfolio />} />
            <Route path="/blogs" element={<Blogs />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
};

export default App;