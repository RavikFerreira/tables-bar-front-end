import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Menu from './components/menus/menu/Menu';
import Login from './components/login/Login';
import Register from './components/register/Register';
import RegisterProducts from './components/products/RegisterProduct';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
