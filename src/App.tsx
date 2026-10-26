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
<<<<<<< HEAD
        <Route path="/" element={<RegisterProducts />} />
=======
        <Route path="/" element={<Menu />} />
>>>>>>> b6a0106d3a00b24b31998e071ea21b840e509793
      </Routes>
    </BrowserRouter>
  );
}

export default App;
