import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Login from './components/loginAndRegistrationScreen/login/Login';
import Register from './components/loginAndRegistrationScreen/register/Register';
import TablesBar from './components/administrativeControl/tables/TablesBar';
import NavBar from './components/navbar/NavBar';
import RegisterProducts from './components/administrativeControl/products/RegisterProducts';
import Order from './components/administrativeControl/orders/Order';
import Menu from './components/menu/Menu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<NavBar/>}>
          <Route path="/cadastrar" element={<RegisterProducts />} />
          <Route path="/" element={<TablesBar />} />
          <Route path="/pedidos" element={<Order />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
