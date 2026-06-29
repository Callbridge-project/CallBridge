import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PhoneIncoming, 
  RefreshCw, 
  BatteryCharging, 
  ShieldCheck, 
  Download, 
  UserCheck, 
  Wifi, 
  Monitor, 
  Lock, 
  Settings, 
  Shield,
  PhoneCall,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Eye,
  Radio
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Local asset mockups
import androidMockup from "@/assets/images/CallBridge Android Mockup.png";
import androidAppPreviewImg from "@/assets/images/Android App Preview.png";
import androidDashboardImg from "@/assets/images/android/dashboard.png";
import androidCallsImg from "@/assets/images/android/calls.png";
import androidSmsImg from "@/assets/images/android/sms-page.png";
import androidDeviceImg from "@/assets/images/android/device.png";
import androidSettingsImg from "@/assets/images/android/settings.png";

// ── CONFIGURATIONS FOR MODULAR MAPS ──────────────────────────────────────

const features = [
  {
    icon: PhoneCall,
    title: "Real-Time Call Monitoring",
    desc: "Instant detection and reporting of every incoming, outgoing, and missed call on your device."
  },
  {
    icon: MessageSquare,
    title: "SMS Activity Tracking",
    desc: "Seamlessly capture and sync message metadata to maintain a complete history of client communications."
  },
  {
    icon: Smartphone,
    title: "Device Integration",
    desc: "Battery levels, signal strength, and connectivity status are tracked to ensure your system is always online."
  },
  {
    icon: RefreshCw,
    title: "Background Sync",
    desc: "Proprietary background service ensures data syncs reliably without impacting your device performance."
  }
];

const steps = [
  { icon: Download, title: "Download APK", desc: "Download the lightweight application directly to your Android device." },
  { icon: Wifi, title: "Grant Permissions", desc: "Enable standard call logs, SMS, and device state access for bridging." },
  { icon: Lock, title: "Secure Pairing", desc: "Pair the device using a unique key to link it securely to your dashboard." },
  { icon: Monitor, title: "View Dashboard", desc: "Access all synced communication activities from any modern web browser." }
];

const phones = [
  { title: "Dashboard", desc: "Central monitoring view", image: androidDashboardImg },
  { title: "Calls", desc: "Real-time call metadata logs", image: androidCallsImg },
  { title: "SMS", desc: "Text messages list history", image: androidSmsImg },
  { title: "Device", desc: "Battery and telemetry metrics", image: androidDeviceImg },
  { title: "Settings", desc: "Selective sync controls", image: androidSettingsImg }
];

const statsData = [
  { value: "50ms", label: "Sync Latency" },
  { value: "256-bit", label: "Encryption" },
  { value: "0.8%", label: "Battery Impact" }
];

const securityCards = [
  {
    title: "AES-256 Tunneling",
    desc: "Your data never travels in the clear. End-to-end encryption from device to dashboard.",
    icon: Lock
  },
  {
    title: "Selective Permission Model",
    desc: "You choose exactly which events are shared with the dashboard.",
    icon: Settings
  }
];

export default function AndroidPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    // Implement exact linear gradient stop values: 0% FFFFFF, 45% D1D5DB, 100% 050B18
    <div 
      className={`min-h-screen flex flex-col justify-between transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "linear-gradient(180deg, #F9F9FF 0%, #E8EEFF 50%, #46546B 87%, #0B1B35 100%)"
      }}
    >
      <Navbar />

      {/* ── SECTION 1: HERO SECTION ────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 relative overflow-hidden py-16 lg:py-24 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] border border-[#D5E1FF] px-4 py-1.5 text-m-xs font-semibold uppercase tracking-wider text-primary select-none">
              <Smartphone className="h-3.5 w-3.5" />
              ANDROID COMPANION APPLICATION
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-5.5xl font-bold text-marketing-dark leading-tight tracking-tight">
              Powerful Mobile Monitoring.<br />
              <span className="text-primary">Lightweight Android Experience.</span>
            </h1>
            
            <p className="text-base text-marketing-light font-normal leading-relaxed max-w-xl">
              The CallBridge Android app securely detects incoming calls, missed calls, SMS activity, and device status in real time, then synchronizes the information directly to your personal dashboard.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a 
                href="#" 
                className="bg-btn-primary-gradient text-white text-sm py-3.5 px-8 rounded-full shadow-btn-primary flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
              >
                <Download className="h-4.5 w-4.5" />
                Download APK
              </a>
              
              <Link 
                to="/register" 
                className="bg-white hover:bg-slate-50 text-slate-800 text-sm py-3.5 px-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
              >
                Learn More
              </Link>
            </div>
            
            {/* Stats Bar */}
            <div className="mt-8 pt-6 flex flex-wrap gap-10">
              {statsData.map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && <div className="h-8 w-px bg-slate-300 self-center hidden sm:block" />}
                  <div>
                    <p className="text-2xl font-bold text-marketing-dark">{stat.value}</p>
                    <p className="text-[10px] text-marketing-light uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Column: App mockup display image */}
          <div className="lg:col-span-6 flex justify-center items-center select-none">
            <img 
              src={androidAppPreviewImg} 
              className="max-h-[460px] object-contain select-none pointer-events-none" 
              alt="Android App Preview" 
            />
          </div>
        </div>

        {/* Wavy background lines pattern at the bottom */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none z-0">
          <svg
            className="w-full h-[220px]"
            viewBox="0 0 1440 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Left curved waves */}
            <path
              d="M -20 120 Q 220 160, 480 200"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />
            <path
              d="M -20 132 Q 220 172, 480 212"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />
            <path
              d="M -20 144 Q 220 184, 480 224"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />

            {/* Right curved waves */}
            <path
              d="M 720 165 Q 1090 225, 1460 210"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />
            <path
              d="M 720 177 Q 1090 237, 1460 222"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />
            <path
              d="M 720 189 Q 1090 249, 1460 234"
              stroke="rgba(37, 99, 235, 0.07)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </section>

      {/* ── SECTION 2: WHY ESSENTIAL FEATURES ───────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-transparent">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-marketing-dark tracking-tight">Why the Android App is Essential</h2>
            <p className="text-marketing-light text-sm font-normal max-w-xl mx-auto leading-relaxed">
              Maximize your telephony productivity with deep system integration built specifically for the Android ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-white rounded-[32px] p-8 shadow-badge-blue flex flex-col text-left space-y-4 hover:-translate-y-1 transition-all duration-300 min-h-[260px]">
                  <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-marketing-dark">{feat.title}</h3>
                  <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW CALLBRIDGE WORKS ────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-transparent">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-3xl font-semibold text-marketing-dark tracking-tight">How CallBridge Works</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Horizontal Line behind icons (Desktop only) */}
            <div className="absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-300 z-0 hidden md:block" />
            
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-4 relative z-10">
                  {/* Numbered icon badge */}
                  <div className="h-24 w-24 rounded-full bg-white border border-slate-200 shadow-badge-blue flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-widest">Step 0{idx+1}</span>
                    <Icon className="h-6 w-6 text-primary mt-1.5" />
                  </div>
                  
                  <div className="space-y-1 text-center">
                    <h4 className="text-sm font-semibold text-marketing-dark">{step.title}</h4>
                    <p className="text-[11px] font-normal text-marketing-light max-w-[200px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: APP GALLERY / PHONE MOCKUPS ──────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-transparent">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-marketing-dark tracking-tight">See It In Action</h2>
            <p className="text-slate-350 text-sm font-normal max-w-md mx-auto">
              Clean interfaces built for continuous background monitoring and zero-latency dashboard viewing.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6">
            {phones.map((phone, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center space-y-4 transition-all duration-300 ${
                  idx % 2 === 1 ? "md:mt-12" : ""
                }`}
              >
                {/* Reusable high-fidelity Phone Mockup Case */}
                <div className="relative mx-auto w-[185px] h-[400px] xl:scale-110 rounded-[24px] bg-[#0E1015] p-[3px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] border-[3px] border-[#181C25] overflow-hidden flex flex-col xl:mb-8">
                  {/* Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#0E1015] rounded-full z-20" />
                  {/* Inside image */}
                  <img 
                    src={phone.image} 
                    className="w-full h-full object-cover rounded-[18px] select-none pointer-events-none" 
                    alt={`${phone.title} Preview`}
                  />
                </div>
                
                <div className="space-y-0.5 select-none text-center">
                  <p className="text-sm font-semibold text-marketing-dark">{phone.title}</p>
                  <p className="text-m-xs text-foreground/80">{phone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: PRIVACY & SECURITY ──────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 text-white bg-[#0B1B35]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Security Rows with clear text visibility (white/slate colors) */}
          <div className="lg:col-span-7 text-left space-y-8 animate-in fade-in duration-500">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-white tracking-tight">Built for Privacy<br /><span className="text-primary">& Security.</span></h2>
              <p className="text-slate-300 text-sm font-normal leading-relaxed max-w-xl">
                Your privacy is our priority. CallBridge never records audio conversations and strictly only synchronizes metadata required for your dashboard reporting.
              </p>
            </div>

            <div className="space-y-4">
              {securityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:bg-white/10 transition-colors duration-300">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">{card.title}</h4>
                      <p className="text-[13px] text-slate-400 leading-relaxed font-normal">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Decorative Mockup Badges Grid with GDPR Elite */}
          <div className="lg:col-span-5 flex items-center justify-center gap-6 select-none pt-8 lg:pt-0">
            {/* ISO Card */}
            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 flex flex-col items-center justify-center text-center w-40 h-40 shadow-lg text-white">
              <ShieldCheck className="h-10 w-10 text-primary mb-3" />
              <span className="text-m-xs font-semibold uppercase tracking-wider text-white">ISO 27001</span>
            </div>
            {/* GDPR Card */}
            <div className="bg-[#005EA1] rounded-[28px] p-6 flex flex-col items-center justify-center text-center w-40 h-40 shadow-lg text-white translate-y-6">
              <ShieldCheck className="h-10 w-10 text-white mb-3" />
              <span className="text-m-xs font-semibold uppercase tracking-wider text-white">GDPR Elite</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 6: FINAL CTA CARD ──────────────────────────────────── */}
      <section 
        className="w-full px-6 lg:px-16 py-20 text-white"
        style={{
          background: "linear-gradient(180deg, #0B1B35 0%, #000000 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="w-full rounded-[40px] py-16 px-8 md:px-12 text-center text-white shadow-xl relative overflow-hidden"
            style={{
              background: "linear-gradient(-90deg, #001C37 0%, #0061A5 100%)"
            }}
          >
            {/* Glow Blobs */}
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Ready to Connect Your Android Device?
              </h2>
              <p className="text-slate-200 text-sm font-normal max-w-md mx-auto leading-relaxed opacity-90">
                Experience the full power of CallBridge with our companion app. Download today and start monitoring in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a 
                  href="#" 
                  className="w-full sm:w-auto bg-white text-[#005EA1] hover:bg-slate-50 text-sm py-3.5 px-8 rounded-full shadow-md flex items-center justify-center gap-2 transition duration-200 font-semibold"
                >
                  <Download className="h-4.5 w-4.5" />
                  Download APK
                </a>
                
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto bg-transparent border border-white hover:bg-white/5 text-white text-sm py-3.5 px-8 rounded-full shadow-sm flex items-center justify-center transition duration-200 font-semibold"
                >
                  Create Account
                </Link>
              </div>

              <p className="text-[10px] font-semibold text-slate-350 uppercase tracking-widest mt-2">
                Free to download. No subscription required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
