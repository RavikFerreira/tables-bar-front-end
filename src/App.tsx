import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Menu from './components/menu/Menu';
import Login from './components/loginAndRegistrationScreen/login/Login';
import Register from './components/loginAndRegistrationScreen/register/Register';
import RegisterProducts from './components/administrativeControl/products/RegisterProduct';
import TablesBar from './components/administrativeControl/tables/TablesBar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/cadastrar" element={<RegisterProducts />} />
        <Route path="/mesas" element={<TablesBar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
