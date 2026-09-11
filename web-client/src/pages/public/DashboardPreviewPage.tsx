import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Monitor, 
  Phone, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  Radio, 
  LifeBuoy, 
  ArrowRight,
  Download,
  Info
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Local asset mockups & screenshots
import dashboardScreenshot from "@/assets/images/dashboard-screenshot.png";
import callsScreenshot from "@/assets/images/calls-screenshot.png";
import smsScreenshot from "@/assets/images/sms-screenshot.png";
import deviceScreenshot from "@/assets/images/device-screenshot.png";
import settingsScreenshot from "@/assets/images/settings-screenshot.png";
import pulseScreenshot from "@/assets/images/pulse-screenshot.png";
import supportScreenshot from "@/assets/images/support-screenshot.png";
import onboardingScreenshot from "@/assets/images/onboarding-screenshot.png";

export default function DashboardPreviewPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const APK_DOWNLOAD_URL = 
  "https://fra.cloud.appwrite.io/v1/storage/buckets/6a8f1255002dcaf4c6b3/files/6a8f16dc0002dab9c5e7/download?project=69f0e3dc000b51d0cfad";
  

  return (
    // Implement exact linear gradient stop values: 0% F9F9FF, 50% E8EEFF, 87% 46546B
    <div 
      className={`min-h-screen flex flex-col justify-between transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "linear-gradient(180deg, #F9F9FF 0%, #E8EEFF 50%, #46546B 87%, #0B1B35 100%)"
      }}
    >
      <Navbar />

      {/* ── SECTION 1: HERO SECTION ────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 relative overflow-hidden py-16 lg:py-24 text-center">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] border border-[#D5E1FF] px-4 py-1.5 text-m-xs font-semibold uppercase tracking-wider text-primary select-none mx-auto">
            <Monitor className="h-3.5 w-3.5" />
            ENTERPRISE MONITORING
          </div>
          
          <h1 className="text-4xl md:text-5.5xl lg:text-6xl font-bold text-marketing-dark leading-tight">
            This is What<br /> <span className="text-primary">Visibility  Looks Like</span>
          </h1>
          
          <p className="text-base text-marketing-light font-normal leading-relaxed max-w-xl mx-auto">
            A real-time dashboard that captures every incoming call, missed call, and SMS from your linked Android device, all in one place.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-btn-primary-gradient text-white text-sm py-3.5 px-8 rounded-full shadow-btn-primary flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
            >
              Explore Features
            </Link>
            
            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 text-sm py-3.5 px-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: BENTO SHOWCASE GRID ──────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-12 bg-transparent">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Row 1: Command Center */}
          <div className="bg-white/90 rounded-[18px] p-8 lg:p-12 -mt-16 shadow-badge-blue grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            <div className="lg:col-span-7 rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-slate-50 flex items-center justify-center select-none">
              <img 
                src={dashboardScreenshot} 
                className="w-full h-auto object-cover" 
                alt="Command Center main interface" 
              />
            </div>
            
            <div className="lg:col-span-5 space-y-4 lg:pl-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-marketing-dark">Command Center</h2>
              <p className="text-marketing-light text-sm font-normal leading-relaxed">
                A high-level command center providing instant visibility into total calls, SMS volume, and real-time system health. Monitor everything at a glance with our intuitive glassmorphic tiles.
              </p>
              <div className="pt-2">
                <Link to="/register" className="inline-flex items-center text-m-xs font-semibold text-primary hover:underline gap-1.5 uppercase tracking-wider">
                  <Radio className="h-4 w-4 animate-pulse" />
                  OPERATIONAL INSIGHTS
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Two Equal Cards (Calls & SMS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Call Monitoring */}
            <div className="bg-white/80 rounded-[32px] p-6 shadow-badge-blue flex flex-col space-y-6">
              <div className=" overflow-hidden bg-slate-50 flex items-center justify-center select-none">
                <img 
                  src={callsScreenshot} 
                  className="w-full h-auto object-cover" 
                  alt="Call Monitoring screenshot" 
                />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-semibold text-marketing-dark">Call Monitoring</h3>
                <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                  Detailed, searchable logs of every incoming and outgoing call, synchronized instantly from your Android device.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/register" className="inline-flex items-center text-m-xs font-semibold text-primary hover:underline gap-1 select-none font-sans">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* SMS Visibility */}
            <div className="bg-white/80 rounded-[32px] p-6 shadow-badge-blue flex flex-col space-y-6">
              <div className=" overflow-hidden bg-slate-50 flex items-center justify-center select-none">
                <img 
                  src={smsScreenshot} 
                  className="w-full h-auto object-cover" 
                  alt="SMS Visibility screenshot" 
                />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-semibold text-marketing-dark">SMS Visibility</h3>
                <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                  A complete history of text conversations with real-time status updates and powerful filtering capabilities.
                </p>
              </div>
              <div className="pt-2">
                <Link to="/register" className="inline-flex items-center text-m-xs font-semibold text-primary hover:underline gap-1 select-none font-sans">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: Device Ecosystem */}
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-12 items-center text-left">
            <div className="lg:col-span-5 space-y-6 lg:pr-4">
              <div className="space-y-4">
                <h2 className="text-2xl lg:text-3xl font-semibold text-marketing-dark">Device Ecosystem</h2>
                <p className="text-marketing-light text-sm font-normal leading-relaxed">
                  Monitor connection status, sync history, and background stability for all your bridged Android devices. Ensure your hardware is always working optimally with dedicated health metrics.
                </p>
              </div>
              
              {/* Device Pill Component Mockup */}
              <div className="bg-[#E8EEFF]/40 border border-[#D5E1FF] rounded-2xl p-4 flex items-center gap-3 w-fit">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="pr-4 select-none">
                  <p className="text-m-xs font-bold text-marketing-dark">Google Pixel 9 Pro</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Android 15 Sync Active</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
            </div>
            
            <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-slate-50 border border-slate-100 flex items-center justify-center select-none">
              <img 
                src={deviceScreenshot} 
                className="w-full h-auto object-cover" 
                alt="Device Ecosystem dashboard" 
              />
            </div>
          </div>

          {/* Row 4: Account & Security Control */}
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-12 items-center text-left">
            <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)] bg-slate-50 border border-slate-100 flex items-center justify-center select-none">
              <img 
                src={settingsScreenshot} 
                className="w-full h-auto object-cover" 
                alt="Account and security settings interface" 
              />
            </div>
            
            <div className="lg:col-span-5 space-y-4 lg:pl-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-marketing-dark">Account & Security Control</h2>
              <p className="text-marketing-light text-sm font-normal leading-relaxed">
                Empower users with granular control over their monitoring environment. From profile management to selective permission toggles and background stability alerts, CallBridge puts privacy and performance in the hands of the administrator.
              </p>
              <div className="pt-2">
                <Link to="/register" className="inline-flex items-center text-m-xs font-semibold text-primary hover:underline gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  PRIVACY MANAGEMENT
                </Link>
              </div>
            </div>
          </div>

          {/* Row 5: Live System Pulse (Full width) */}
          <div className="bg-white/70 rounded-[32px] p-8 lg:p-12 pb-0 lg:pb-0 shadow-badge-blue text-left space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <h2 className="text-2xl lg:text-3xl font-semibold text-marketing-dark flex items-center gap-2">
                  <Radio className="h-6 w-6 text-primary animate-pulse" />
                  Live System Pulse
                </h2>
                <p className="text-marketing-light text-sm font-normal max-w-2xl">
                  A live timeline of all system events, synchronization pulses, and monitoring alerts in one unified view. Track the heartbeat of your device monitoring.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden flex items-center justify-center select-none">
              <img 
                src={pulseScreenshot} 
                className="w-full h-auto object-cover" 
                alt="Live system logs activity logs screen" 
              />
            </div>
          </div>

          {/* Row 6: Two Equal Support / Onboarding Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Integrated Support */}
            <div className="bg-white/70 rounded-[32px] p-6 pb-10 shadow-badge-blue flex flex-col space-y-6">
              <div className="rounded-[25px] overflow-hidden bg-slate-50 flex items-center justify-center select-none">
                <img 
                  src={supportScreenshot} 
                  className="w-full h-auto object-cover" 
                  alt="Integrated support panel" 
                />
              </div>
              <div className="space-y-2 flex-1">
                {/* <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <LifeBuoy className="h-5 w-5" />
                </div> */}
                <h3 className="text-xl font-semibold text-marketing-dark pt-1">Integrated Support</h3>
                <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                  Direct access to technical assistance without leaving your command center. Open tickets, check status updates, and sync logs in one unified tab.
                </p>
              </div>
            </div>

            {/* Guided Onboarding */}
            <div className="bg-white/70 rounded-[32px] p-6 shadow-badge-blue flex flex-col space-y-6 pb-10">
              <div className="rounded-[25px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-slate-50 flex items-center justify-center select-none">
                <img 
                  src={onboardingScreenshot} 
                  className="w-full h-auto object-cover" 
                  alt="Guided onboarding overlay" 
                />
              </div>
              <div className="space-y-2 flex-1">
                {/* <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div> */}
                <h3 className="text-xl font-semibold text-marketing-dark pt-1">Guided Onboarding</h3>
                <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                  A guided 4-step onboarding process to ensure you are up and running in minutes. Connect linked accounts and permissions securely.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3: FINAL CTA ────────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-24 text-white relative overflow-hidden bg-transparent">
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Start Monitoring Today.</h2>
          <p className="text-slate-300 text-sm font-normal max-w-lg mx-auto leading-relaxed opacity-90">
            Gain immediate visibility into your communication logs and active devices safely.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register"
              className="w-full sm:w-auto bg-btn-primary-gradient text-white font-semibold py-4 px-8 rounded-full shadow-btn-primary flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition duration-200 select-none"
            >
              Get Started Free
            </Link>
            
            <a 
              href={APK_DOWNLOAD_URL}
              download="callbridge-v1.0.apk" 
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-full border border-white/10 shadow-sm flex items-center justify-center transition duration-200 gap-2"
            >
              <Download className="h-4.5 w-4.5" />
              Download APK
            </a>
          </div>

          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">
            No credit card. No setup fee.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
