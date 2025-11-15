import React from 'react';
import { Helmet } from 'react-helmet';
import Developers from '@/components/Developers';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - QR Attendance System</title>
        <meta name="description" content="Meet the passionate developers, Mahnoor and Muhammad Haris Khan, behind the QR Attendance System." />
      </Helmet>
      <div className="pt-24">
        <Developers />
      </div>
    </>
  );
};

export default AboutPage;