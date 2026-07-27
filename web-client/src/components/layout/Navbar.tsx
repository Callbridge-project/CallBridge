import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo1 from "../../assets/logo1.png";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", path: "/" },
    { name: "Dashboard Preview", path: "/dashboard-preview" },
    { name: "Android", path: "/android" },
    { name: "Contact", path: "/contact" }
  ];

  const isLinkActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md px-6 lg:px-16 transition-all duration-300 select-none ${
      isScrolled 
        ? "h-[4.5rem] bg-[#F9F9FF]/95 shadow-sm border-b border-[#E2E8F0]/40" 
        : "h-24 bg-transparent border-b border-white/20 shadowsm"
    }`}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img src={logo1} className={`object-contain transition-all duration-300 ${isScrolled ? "h-12" : "h-16"}`} alt="CallBridge Logo" />
        </Link>
        
        {/* Center: Navigation Links */}
        <div className="hidden md:flex h-full items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-sm transition-all duration-200 py-1.5 ${
                  active 
                    ? "text-[#005EA1] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-[calc(100%-5px)] after:mx-auto after:bg-[#005EA1] after:rounded-full font-semibold" 
                    : "text-[#414751] hover:text-[#005EA1]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-600 hover:text-[#005EA1] transition-colors duration-200"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-[#005EA1] hover:bg-[#004d80] text-white text-sm px-6 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,94,161,0.15)] hover:shadow-[0_4px_16px_rgba(0,94,161,0.25)] active:scale-98 transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-50 text-slate-600 md:hidden focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className={`absolute left-0 right-0 border-b bg-[#F9F9FF]/95 shadow-lg backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-200 md:hidden z-40 transition-all duration-300 ${
          isScrolled ? "top-16 border-[#E2E8F0]/40" : "top-20 border-white/20"
        }`}>
          <div className="flex flex-col gap-4 p-6">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold p-2 rounded-xl transition-all duration-200 ${
                    active ? "bg-blue-50/50 text-[#005EA1]" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="h-px bg-slate-100 my-2" />
            <div className="flex items-center gap-4 w-full">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full bg-[#005EA1] text-sm font-bold text-white shadow-md hover:bg-[#004d80] transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
