import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PhoneCall, 
  MessageSquare, 
  Bell, 
  BarChart2, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Database, 
  Lock, 
  ChevronDown, 
  Download,
  Phone,
  RefreshCw,
  Radio,
  EyeOff,
  CloudOff
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Local asset mockups
import androidMockup from "@/assets/images/CallBridge Android Mockup.png";
import phonesMockup from "@/assets/images/phones-mockup.png";
import deviceSyncImg from "@/assets/images/Cinematic composition showing device synchronization.png";

// ── CONFIGURATIONS FOR MODULAR MAPS ──────────────────────────────────────

const whyCards = [
  {
    title: "Information Gaps",
    desc: "Important call and SMS activities are often difficult to monitor across platforms. CallBridge syncs it all to one secure dashboard in real-time",
    icon: EyeOff
  },
  {
    title: "Data Silos",
    desc: "Your call & SMS logs shouldn't be trapped. We ensure your logs are accessible from any browser, anywhere.",
    icon: CloudOff
  },
  {
    title: "Trust Issues",
    desc: "We prioritize end-to-end encryption, ensuring your personal communications stay strictly personal.",
    icon: ShieldCheck
  }
];

const bentoFeatures = [
  {
    title: "Call Mirroring",
    desc: "Sync incoming and outgoing call metadata instantly to your secure dashboard.",
    icon: PhoneCall
  },
  {
    title: "SMS Vault",
    desc: "Store and search through text messages with powerful filtering tools and labels.",
    icon: MessageSquare
  },
  {
    title: "Push Alerts",
    desc: "Get desktop notifications the moment your phone receives a critical communication.",
    icon: Bell
  },
  {
    title: "Visual Reports",
    desc: "Understand patterns with beautiful charts representing your daily communication flow.",
    icon: BarChart2
  },
  {
    title: "Real-Time Visibility",
    desc: "Monitor Android call and SMS activity through a connected web interface.",
    icon: Eye
  },
  {
    title: "Remote Wipe",
    desc: "In case of emergency, remotely clear synced logs to protect sensitive data.",
    icon: Trash2
  }
];

const setupSteps = [
  "Download the APK from our secure portal.",
  "Create an Account to secure your command center credentials..",
  "Grant the necessary permissions for bridging.",
  "View real-time data flowing to your dashboard.."
];

const faqItems = [
  {
    q: "Is CallBridge free to use?",
    a: "CallBridge is free for individual use. You can link one device and access your full dashboard at no cost."
  },
  {
    q: "Does it record actual phone conversations?",
    a: "No. CallBridge only captures metadata — call timestamps, phone numbers, contact names, and SMS content. No audio is ever recorded."
  },
  {
    q: "Can I monitor multiple phones at once?",
    a: "Yes. Link multiple Android devices to a single CallBridge account and see all activity in one unified dashboard."
  }
];

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div 
      className={`min-h-screen bg-[#F9FAFC] flex flex-col justify-between transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`} 
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 40%, #1A1A2B 75%, #0A0A1A 100%)"
      }}
    >
      <Navbar />

      {/* ── SECTION 1: HERO SECTION ────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 relative overflow-hidden py-16 lg:py-24 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] border border-[#D5E1FF] px-4 py-1.5 text-m-xs font-semibold uppercase tracking-wider text-[#005EA1] select-none">
              <ShieldCheck className="h-3.5 w-3.5" />
              RELIABLE MONITORING
            </div>
            
            <h1 className="text-4xl md:text-5.5xl lg:text-6xl font-bold text-[#1A1A2B] leading-tight tracking-tight font-sans">
              Know Every Call.<br />
              Every Message.
            </h1>
            
            <p className="text-base text-[#6B7A99] leading-relaxed max-w-xl">
              The most sophisticated bridge between your Android device and a real-time web dashboard for synchronized call logs, SMS activity, device monitoring, extending remote visibility
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link 
                to="/register" 
                className="bg-btn-primary-gradient text-white text-sm py-3.5 px-8 rounded-full shadow-btn-primary flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
              >
                <Download className="h-4.5 w-4.5" />
                Download APK
              </Link>
              
              <Link 
                to="/login" 
                className="bg-white hover:bg-slate-50 text-slate-800 text-sm py-3.5 px-8 rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:scale-[1.02] active:scale-98 transition-all duration-200 font-semibold"
              >
                Get Started
              </Link>
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-6 text-m-xs font-semibold text-slate-500 pt-4">
              <span className="flex items-center gap-1.5 select-none">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                AES-256 Encrypted
              </span>
              <span className="flex items-center gap-1.5 select-none">
                <Zap className="h-4 w-4 text-slate-400" />
                Real-time Sync
              </span>
            </div>
          </div>
          
          {/* Right: Phone Mockup & Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[580px] lg:h-[620px] select-none">
            {/* Soft Glow Background */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            {/* Smartphone Case */}
            <div className="relative w-[285px] h-[570px] rounded-[42px] bg-[#0E1015] p-[10px] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border-[7px] border-[#181C25] overflow-hidden flex flex-col">
              {/* Phone Screen Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0E1015] rounded-full z-20" />
              
              {/* Inner Dashboard Mockup Screen */}
              <div className="flex-1 bg-white rounded-[32px] overflow-hidden flex flex-col p-5 pt-10 text-left space-y-5">
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-m-xs font-extrabold text-slate-800 tracking-wider">Dashboard</span>
                  <div className="h-4 w-12 rounded-full bg-slate-100" />
                </div>
                
                {/* Main Top Widget Card */}
                <div className="bg-blue-500/[0.04] border border-blue-500/[0.08] rounded-2xl p-4 space-y-3 w-full">
                  <div className="h-4.5 w-3/4 bg-blue-500/15 rounded-full" />
                  <div className="h-4.5 w-1/2 bg-[#005EA1]/20 rounded-full" />
                </div>

                {/* Grid of Two Small Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-100 bg-slate-50/30 rounded-xl h-16" />
                  <div className="border border-slate-100 bg-slate-50/30 rounded-xl h-16" />
                </div>

                {/* Activity rows */}
                <div className="space-y-4 pt-1">
                  {/* Green row */}
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-32 bg-slate-200 rounded-full" />
                      <div className="h-2 w-20 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                  {/* Blue row */}
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-blue-100 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-36 bg-slate-200 rounded-full" />
                      <div className="h-2 w-24 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING BADGES */}
            {/* Top-Left: Calls Synced */}
            <div className={`absolute top-[18%] -left-[14%] bg-white border border-slate-100/70 rounded-2xl p-3 shadow-badge-blue flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 ease-out delay-100 ${
              isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}>
              <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-500 shrink-0">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-m-xs font-bold text-[#1A1A2B]">Calls Synced</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Just now</p>
              </div>
            </div>

            {/* Bottom-Left: Active Calls */}
            <div className={`absolute bottom-[16%] -left-[12%] bg-white border border-slate-100/70 rounded-2xl p-3 shadow-badge-blue flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 ease-out delay-300 ${
              isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}>
              <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-500 shrink-0">
                <Phone className="h-4.5 w-4.5 rotate-90" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Calls</p>
                <p className="text-base font-extrabold text-[#1A1A2B] mt-0.5">1,284</p>
              </div>
            </div>

            {/* Top-Right: SMS Bridged */}
            <div className={`absolute top-[38%] -right-[12%] bg-white border border-slate-100/70 rounded-2xl p-3 shadow-badge-blue flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 ease-out delay-200 ${
              isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}>
              <div className="h-9 w-9 rounded-full bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
                <MessageSquare className="h-4.5 w-4.5" />
              </div>
              <div className="text-left animate-in fade-in duration-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SMS Bridged</p>
                <p className="text-base font-extrabold text-[#1A1A2B] mt-0.5">458</p>
              </div>
            </div>

            {/* Bottom-Right: Monitoring Active */}
            <div className={`absolute bottom-[22%] -right-[10%] bg-white border border-slate-100/70 rounded-2xl p-3 shadow-badge-blue flex items-center gap-3 hover:-translate-y-1 transition-all duration-300 ease-out delay-400 ${
              isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}>
              <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100/50 flex items-center justify-center text-[#005EA1] shrink-0">
                <Radio className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <p className="text-m-xs font-bold text-[#1A1A2B]">Monitoring Active</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time status</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: WHY CALLBRIDGE EXISTS ──────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-transparent">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold text-marketing-dark tracking-tight">Why CallBridge Exists</h2>
            <p className="text-marketing-light text-sm font-normal max-w-xl mx-auto leading-relaxed">
              Traditional monitoring is limited. We've built a bridge between complete visibility across multiple devices and digital security.
            </p>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {whyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white rounded-[32px] p-10 shadow-badge-blue flex flex-col items-start text-left space-y-4 hover:-translate-y-1 transition-all duration-300 min-h-[260px]">
                  <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-marketing-dark">{card.title}</h3>
                  <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: FEATURES GRID ──────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-[#F1F3FF]/50">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-3 text-left">
              <h2 className="text-3xl md:text-4xl font-semibold text-marketing-dark tracking-tight">Everything You Need. Nothing You Don't.</h2>
              <p className="text-marketing-light text-sm font-normal">
                A complete set of monitoring tools for professionals managing multiple devices.
              </p>
            </div>
            <Link to="/dashboard-preview" className="text-m-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View Technical Specs →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bentoFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-white rounded-[32px] min-h-[260px] p-8 text-left space-y-4 shadow-badge-blue hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                  <h4 className="text-base font-semibold text-marketing-dark">{feat.title}</h4>
                  <p className="text-marketing-light text-m-xs font-normal leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS & APP SHOWCASE ──────────────────────── */}
      <section 
        className="w-full px-6 lg:px-16 py-20 text-white"
        style={{
          background: "linear-gradient(180deg, #F1F3FF80 0%, #475569 40%, #1A1A2B 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & Steps */}
          <div className="lg:col-span-6 text-left space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">Download the App.<br />Start Monitoring Today.</h2>
              <p className="text-slate-200 text-sm font-normal max-w-md leading-relaxed opacity-90">
                The CallBridge Android agent is lightweight, battery-efficient, and runs silently in the background. Setup takes less than 90 seconds.
              </p>
            </div>

            <div className="space-y-5">
              {setupSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-7 w-7 rounded-full bg-[#005EA1] text-white flex items-center justify-center font-semibold text-m-xs shrink-0 select-none">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-normal text-white/95">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone Mockup Image */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <img 
              src={phonesMockup} 
              className="max-h-[500px] object-contain select-none pointer-events-none" 
              alt="CallBridge Android App Showcase" 
            />
          </div>

        </div>
      </section>

      {/* ── SECTION 5: ABOUT & MISSION ─────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 bg-[#1A1A2B] py-20 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-12 items-center">
          
          {/* Left: Mission & Stats */}
          <div className="lg:col-span-4 text-left space-y-6">
            <h5 className="text-m-xs font-semibold text-primary tracking-widest uppercase">Our Mission</h5>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-relaxed">Built for Clarity.<br />Designed for Trust.</h2>
            <p className="text-[#A0AEC0] text-sm md:text-base font-normal leading-relaxed max-w-md">
              We believe communication is the lifeblood of every professional relationship. CallBridge was born from the need for a reliable, secure, and transparent way to archive and manage critical web and mobile interactions.
            </p>

            <div className="flex gap-12 pt-4">
              <div>
                <p className="text-3xl md:text-4xl font-semibold text-primary">99.9%</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Uptime SLA</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-semibold text-primary">1M+</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Messages Synced</p>
              </div>
            </div>
          </div>

          {/* Right: Mockup Image */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <img 
              src={deviceSyncImg} 
              className="rounded-3xl max-h-[420px] object-contain select-none pointer-events-none" 
              alt="Device Synchronization Showcase" 
            />
          </div>

        </div>
      </section>

      {/* ── SECTION 6: FAQ ACCORDION ────────────────────────────────────── */}
      <section 
        className="w-full px-6 lg:px-16 py-20 text-white"
        style={{
          background: "linear-gradient(180deg, #1A1A2B 0%, #0A0A1A 100%)"
        }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-12">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Common Questions Answered</h2>
            <p className="text-slate-400 text-sm">
              Everything you need to know about CallBridge.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFAQIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#ffffff]/5 border border-white/[0.04] rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between p-6 md:px-8 text-left font-semibold text-sm text-slate-100 hover:text-white transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 md:px-8 text-left text-[13px] text-slate-450 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
