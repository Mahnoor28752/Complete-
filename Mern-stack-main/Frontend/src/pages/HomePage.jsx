import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Developers from '@/components/Developers';
import ContactModule from '@/components/ContactModule'; // NEW COMPONENT

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>QR Attendance System - Smart Role-Based Attendance Tracking</title>
        <meta name="description" content="Revolutionary QR code-based attendance system with role-based access for Admins, Teachers, and Students. Prevent proxy attendance with secure authentication." />
      </Helmet>
      <Hero />
      <Features />
      <HowItWorks />
      <Developers />
      <ContactModule /> 
    </>
  );
};

export default HomePage;