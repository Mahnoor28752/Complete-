import React from 'react';
import { Helmet } from 'react-helmet';
import HowItWorks from '@/components/HowItWorks';

const HowItWorksPage = () => {
  return (
    <>
      <Helmet>
        <title>How It Works - QR Attendance System</title>
        <meta name="description" content="Learn the simple four-step process of our secure and accurate attendance tracking system." />
      </Helmet>
      <div className="pt-24">
        <HowItWorks />
      </div>
    </>
  );
};

export default HowItWorksPage;