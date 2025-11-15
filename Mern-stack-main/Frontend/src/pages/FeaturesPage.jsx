import React from 'react';
import { Helmet } from 'react-helmet';
import Features from '@/components/Features';

const FeaturesPage = () => {
  return (
    <>
      <Helmet>
        <title>Features - QR Attendance System</title>
        <meta name="description" content="Explore the powerful features of the QR Attendance System, including role-based portals, proxy prevention, and advanced reporting." />
      </Helmet>
      <div className="pt-24">
        <Features />
      </div>
    </>
  );
};

export default FeaturesPage;