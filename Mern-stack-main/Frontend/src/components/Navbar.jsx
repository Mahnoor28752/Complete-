import React from "react";
import { motion } from "framer-motion";
import { NavLink, Link } from "react-router-dom";
import { QrCode, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Navbar = () => {
  const handleGetStartedClick = () => {
    toast({
      title:
        "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const navLinkStyle = ({ isActive }) =>
    `relative text-gray-300 hover:text-white transition-colors ${
      isActive ? "font-semibold" : ""
    }`;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gradient">Attendy</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/features" className={navLinkStyle}>
              {({ isActive }) => (
                <>
                  <motion.span whileHover={{ y: -2 }} className="block">
                    Features
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                    />
                  )}
                </>
              )}
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkStyle}>
              {({ isActive }) => (
                <>
                  <motion.span whileHover={{ y: -2 }} className="block">
                    How It Works
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                    />
                  )}
                </>
              )}
            </NavLink>
            <NavLink to="/about" className={navLinkStyle}>
              {({ isActive }) => (
                <>
                  <motion.span whileHover={{ y: -2 }} className="block">
                    About
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                    />
                  )}
                </>
              )}
            </NavLink>
            <NavLink to="/contact" className={navLinkStyle}>
              {({ isActive }) => (
                <>
                  <motion.span whileHover={{ y: -2 }} className="block">
                    Contact
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                    />
                  )}
                </>
              )}
            </NavLink>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-transform text-white">
                Get Started
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleGetStartedClick}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
