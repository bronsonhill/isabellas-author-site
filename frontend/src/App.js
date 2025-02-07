import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { app } from "./firebase";
import './App.css';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Blog from './pages/Blog';
import BlogPost from './components/BlogPage/BlogPost';
import Layout from './components/Layout';

const App = () => {
  return (
    <div className="app">
      <Router>
        <Layout>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blogs/:id" element={<BlogPost />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
};

export default App;