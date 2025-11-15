import React from 'react';

const HeroImage = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="dashboard-mockup">
        <div className="mockup-header">
          <div className="mockup-dot"></div>
          <div className="mockup-dot"></div>
          <div className="mockup-dot"></div>
        </div>
        <div className="qr-container">
          <div className="scan-line"></div>
          <div className="corner-frame tl"></div>
          <div className="corner-frame tr"></div>
          <div className="corner-frame bl"></div>
          <div className="corner-frame br"></div>
          <div className="qr-code">
            {Array.from({ length: 64 }).map((_, index) => (
              <div key={index} className="qr-pixel"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;