import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, HelpCircle } from "lucide-react";

// Import Logo assets
import logoImg from "@/assets/images/logo.png";
import footerLogoImg from "@/assets/images/footer-logo.png";

interface AuthLayoutProps {
  heroSlot: React.ReactNode;
  cardSlot: React.ReactNode;
}

export default function AuthLayout({ heroSlot, cardSlot }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-auth-radial text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-600">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex py-3 w-full items-center justify-between bg-[#F9F9FF]/70 border-b border-white/20 shadow-sm px-6 backdrop-blur-md lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoImg} className="h-14 object-contain" alt="CallBridge Logo" />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-normal text-slate-500 hover:text-slate-900 transition">Features</Link>
            <Link to="/dashboard-preview" className="text-sm font-normal text-slate-500 hover:text-slate-900 transition">Dashboard Preview</Link>
            <Link to="/android" className="text-sm font-normal text-slate-500 hover:text-slate-900 transition">Android</Link>
            <Link to="/contact" className="text-sm font-normal text-slate-500 hover:text-slate-900 transition">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              className="text-sm font-semibold text-primary hover:text-primary/80 transition underline decoration-2 underline-offset-4" 
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <Button 
              variant="outline" 
              className="hidden border-2 border-primary hover:bg-primary/5 text-primary rounded-full px-5 text-sm font-semibold sm:inline-flex bg-inherit"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12 md:py-20 lg:pb-32 xl:pb-40 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
        
        {/* LEFT PANEL - HERO */}
        <div className="flex flex-1 flex-col justify-center lg:max-w-xl">
          {heroSlot}
        </div>

        {/* RIGHT PANEL - FORM CARD & FEATURES */}
        <div className="mt-12 flex flex-1 flex-col items-center lg:mt-0 lg:max-w-lg w-full">
          {cardSlot}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-login-footer text-white px-6 py-10 md:py-12 lg:py-16 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <img src={footerLogoImg} className="h-8 object-contain" alt="CallBridge Logo" />
            <span className="text-xs font-normal text-slate-400">
              © 2024 CallBridge. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-normal text-slate-400">
            <Link to="/policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/policy" className="hover:text-white transition">Terms of Service</Link>
            <Link to="#support" className="hover:text-white transition">Support Center</Link>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button className="rounded-full border border-slate-700 p-2 hover:bg-slate-800 hover:text-white transition">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="rounded-full border border-slate-700 p-2 hover:bg-slate-800 hover:text-white transition">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
