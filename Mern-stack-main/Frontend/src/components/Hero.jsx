import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Hero = () => {
  const handleClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950/50 via-blue-950/30 to-indigo-950/50"></div>
      
      <div className="container mx-auto relative z-10">
        {/* SIDE-BY-SIDE LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Revolutionary Attendance Tracking</span>
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            >
              Smart Attendance with
              <span className="block text-gradient mt-2">QR Code Technology</span>
            </motion.h1>

            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-300 mb-8"
            >
              Eliminate proxy attendance with our secure, role-based system. 
              Designed for Admins, Teachers, and Students with cutting-edge QR authentication.
            </motion.p>

            {/* Stats Section */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">99.9%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">3 Sec</div>
                <div className="text-sm text-gray-400">Per Student</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">100%</div>
                <div className="text-sm text-gray-400">Proxy-Free</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                style={{color:"white"}}
                onClick={handleClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 transform hover:scale-105 transition-transform"
              >
                <QrCode className="w-5 h-5 mr-2"style={{color:"white"}} />
                Start Free Trial
              </Button>
              <Button
                onClick={handleClick}
                size="lg"
                variant="outline"
                className="border-2 border-white/20 hover:bg-white/10 text-lg px-8 py-6 transform hover:scale-105 transition-transform"
              >
                <Shield className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Right Side - Image/Visual */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl animate-pulse"></div>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="relative glass-effect rounded-2xl p-8 transition-transform"
            >
              {/* QR Scanner Dashboard */}
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
            </motion.div>
          </motion.div>
        </div>
      </div>

  <style>{`
        .dashboard-mockup {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-radius: 30px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .mockup-header {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .mockup-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: dotPulse 2s ease-in-out infinite;
        }

        .mockup-dot:nth-child(1) { background: #6A0DAD; }
        .mockup-dot:nth-child(2) { background: #FFD700; animation-delay: 0.2s; }
        .mockup-dot:nth-child(3) { background: #00D084; animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        .qr-container {
          width: 100%;
          height: calc(100% - 40px);
          background: linear-gradient(135deg, rgba(106, 13, 173, 0.1), rgba(255, 215, 0, 0.1));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 12px;
          background: linear-gradient(90deg, transparent, #6A0DAD, transparent);
          top: 0;
          animation: scan 3s ease-in-out infinite;
        }

        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }

        .qr-code {
          width: 70%;
          height: 70%;
          background: #fff;
          border-radius: 15px;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(8, 1fr);
          gap: 3px;
          padding: 15px;
          position: relative;
          z-index: 1;
        }

        .qr-pixel {
          background: #000;
          border-radius: 2px;
          animation: pixelAppear 1s ease-in-out infinite;
        }

        .qr-pixel:nth-child(4n) { animation-delay: 0.1s; }
        .qr-pixel:nth-child(4n+1) { animation-delay: 0.2s; }
        .qr-pixel:nth-child(4n+2) { animation-delay: 0.3s; }

        @keyframes pixelAppear {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }

        .corner-frame {
          position: absolute;
          width: 50px;
          height: 50px;
          border: 3px solid #6A0DAD;
          animation: cornerPulse 2s ease-in-out infinite;
        }

        .corner-frame.tl {
          top: 10%;
          left: 10%;
          border-right: none;
          border-bottom: none;
        }

        .corner-frame.tr {
          top: 10%;
          right: 10%;
          border-left: none;
          border-bottom: none;
          animation-delay: 0.5s;
        }

        .corner-frame.bl {
          bottom: 10%;
          left: 10%;
          border-right: none;
          border-top: none;
          animation-delay: 1s;
        }

        .corner-frame.br {
          bottom: 10%;
          right: 10%;
          border-left: none;
          border-top: none;
          animation-delay: 1.5s;
        }

        @keyframes cornerPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Hero;