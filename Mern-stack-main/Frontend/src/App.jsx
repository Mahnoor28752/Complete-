import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginSignUp from './pages/LoginSignUp';
import Admin from './pages/Admin';
import Teacher from './pages/Teacher';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Routes>
      {/* Routes with Layout (Navbar included) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      
      {/* Login route without Layout (No Navbar) */}
      <Route path="/login" element={<LoginSignUp />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/teacher" element={<Teacher />} />
  <Route path="/student" element={<StudentDashboard />} />
    </Routes>
    // <Admin/>
    // <Teacher/>
    // <StudentDashboard/>
    
  );
}

export default App;