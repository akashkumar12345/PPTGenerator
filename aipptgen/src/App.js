import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import AiChatPptApp from './APIGen/ApiGen';
import SlideGenerator from './APIGen/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SlideGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
