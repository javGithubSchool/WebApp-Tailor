// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer'
import NavBar from './components/NavBar';
import ScrollTop from './components/ScrollTop';
import AdminHomePage from './pages/AdminHomePage'
import AdminOrgPage from './pages/AdminOrgPage'
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Category } from './pages/Category';
import { CategoryItem } from './pages/CategoryItem';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import AdminLogin from './pages/AdminLogin'
import NewLandingPage from './pages/new-landing-page'; // Correct import statement
import RegisterOrg from './pages/RegisterOrg'

const ProtectAdminRoute = ({ element }) => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    if(!token) {
        navigate('/admin/login');
        return null;
    }

    return element;
}

const AppContent = () => {
    const location = useLocation();

    return (
        <>
            {!(location.pathname === '/Login' || location.pathname === '/Register' || location.pathname.includes("admin")) && (location.pathname === '/' ? <Header /> : <NavBar />)}
            <ScrollTop />
            <Routes>
                <Route path="/" element={<NewLandingPage />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Shop" element={<Shop />} />
                <Route path="/About" element={<About />} />
                <Route path="/Contact" element={<Contact />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Corporate" element={<Category type="Corporate" />} />
                <Route path="/Government" element={<Category type="Government" />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/Corporate/:company" element={<CategoryItem />} />

                 {/* Protect the following admin routes */}
                <Route path="/admin/dashboard" element={<ProtectAdminRoute element={<AdminHomePage />} />} />
                <Route path="/admin/corporate/orgs" element={<ProtectAdminRoute element={<AdminOrgPage />} />} />
                <Route path="/admin/corporate/orgs/register" element={<ProtectAdminRoute element={<RegisterOrg />} />} />

            </Routes>
            {!(location.pathname === '/Login' || location.pathname === "/" || location.pathname === '/Register' || location.pathname.includes("admin")) && <Footer />}
        </>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
