import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  RefreshCw, 
  Clock, 
  Cloud, 
  Calendar, 
  Share2, 
  HelpCircle,
  Globe,
  ShieldCheck
} from "lucide-react";
import footerLogoImg from "@/assets/images/footer-logo.png";

export default function PolicyPage() {
  const navigate = useNavigate();

  const syncDetails = [
    {
      id: 1,
      desc: "Real-time metadata capture for operational analysis.",
      icon: RefreshCw,
    },
    {
      id: 2,
      desc: "Temporary storage of session logs for diagnostic purposes, retained for no longer than 30 days.",
      icon: Clock,
    },
    {
      id: 3,
      desc: "Encrypted synchronization across authorized administrative dashboards.",
      icon: Cloud,
    }
  ];

  return (
    <div className="flex min-h-screen flex-col justify-between bg-auth-radial text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-600">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-[#F9F9FF]/70 border-b border-white/20 shadow-sm px-6 backdrop-blur-md lg:px-16">
        {/* Left: Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-50 text-slate-600 transition focus:outline-none"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>

        {/* Center: Title */}
        <h2 className="text-base font-bold text-slate-900 select-none tracking-tight">
          Platform Policy
        </h2>

        {/* Right: Spacer for perfect centering */}
        <div className="w-10" />
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-4xl flex-col px-6 py-12 md:py-16 flex-1">
        
        {/* Intro/Hero Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100/85 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Shield className="h-3.5 w-3.5" />
            Official Documentation
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight font-serif">
            User Agreements & Privacy Standards
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            Transparency and security are the cornerstones of our architecture. At CallBridge, we maintain rigorous standards to ensure your telephony monitoring remains safe, private, and compliant.
          </p>
        </div>

        {/* Central Policy Card */}
        <Card className="border border-slate-100/50 shadow-badge-blue rounded-2xl bg-white p-8 md:p-12 mt-10 relative overflow-hidden space-y-8">
          
          {/* Section 1: Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <span className="h-5 w-1 bg-primary rounded-full shrink-0" />
              <h3 className="text-base font-bold text-slate-950">1. Introduction</h3>
            </div>
            <div className="space-y-3.5 text-sm text-muted-foreground font-normal leading-relaxed pl-4">
              <p>
                Welcome to <span className="text-primary font-bold">CallBridge</span>. This document outlines our unwavering commitment to providing secure telephony monitoring and bridging solutions. By accessing our platform, you agree to these fundamental standards designed to protect all stakeholders.
              </p>
              <p>
                Our mission is to provide enterprise-grade connectivity through fluid crystal clarity. We believe that professional telephony monitoring should be accessible without compromising the integrity of the data being transmitted.
              </p>
            </div>
          </div>

          {/* Section 2: Data Usage & Synchronization */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <span className="h-5 w-1 bg-primary rounded-full shrink-0" />
              <h3 className="text-base font-bold text-slate-950">2. Data Usage & Synchronization</h3>
            </div>
            <div className="space-y-4 pl-4">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                <span className="text-primary font-bold">CallBridge</span> facilitates the seamless bridging of voice calls and SMS data. This synchronization occurs in real-time, utilizing our proprietary low-latency cloud infrastructure.
              </p>
              
              {/* Bullet List */}
              <div className="space-y-3.5 pt-1">
                {syncDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary border border-blue-100 shadow-sm shadow-blue-500/5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground mt-0.5 leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: User Responsibility */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <span className="h-5 w-1 bg-primary rounded-full shrink-0" />
              <h3 className="text-base font-bold text-slate-950">3. User Responsibility</h3>
            </div>
            <div className="space-y-4 pl-4">
              <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                Integrity is vital to the <span className="text-primary font-bold">CallBridge</span> ecosystem. Users are strictly required to verify ownership or explicit authorization for any device integrated into our platform.
              </p>
              
              {/* Callout Box */}
              <div className="rounded-2xl bg-blue-50/20 border border-blue-50/50 p-5 md:p-6">
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                  "The platform must not be used for unauthorized surveillance. It is the sole responsibility of the account holder to ensure that the monitoring of telephony data complies with local and international jurisdictional laws."
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Privacy Architecture */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <span className="h-5 w-1 bg-primary rounded-full shrink-0" />
              <h3 className="text-base font-bold text-slate-950">4. Privacy Architecture</h3>
            </div>
            <div className="space-y-4 pl-4">
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* E2E Encryption Card */}
                <div className="border border-slate-100/80 rounded-2xl p-5 bg-slate-50/30 flex flex-col gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary border border-blue-100">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-primary">End-to-End Encryption</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-normal">
                      All packets transmitted via CallBridge are shielded using military-grade AES-256 encryption, ensuring no mid-flight interception.
                    </p>
                  </div>
                </div>

                {/* Zero Knowledge Card */}
                <div className="border border-slate-100/80 rounded-2xl p-5 bg-slate-50/30 flex flex-col gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary border border-blue-100">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-primary">Zero-Knowledge Storage</h4>
                    <p className="text-xs text-muted-foreground font-medium leading-normal">
                      Our cloud infrastructure is designed so that even our administrators cannot access the content of bridged communications.
                    </p>
                  </div>
                </div>

              </div>

              <p className="text-sm text-muted-foreground font-normal leading-relaxed pt-1">
                Our Fluid Crystal design philosophy extends to our back-end: clear, structured, and impenetrable. We maintain physical and logical separation of data sets to prevent cross-contamination of user information.
              </p>
            </div>
          </div>

          {/* Section 5: Consent */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <span className="h-5 w-1 bg-primary rounded-full shrink-0" />
              <h3 className="text-base font-bold text-slate-950">5. Consent</h3>
            </div>
            <div className="space-y-3.5 text-sm text-muted-foreground font-normal leading-relaxed pl-4">
              <p>
                By utilizing the <span className="text-primary font-bold">CallBridge</span> platform, you provide explicit consent for the processing of telephony data as described herein. You acknowledge that your interaction with the service constitutes a binding agreement to adhere to these standards.
              </p>
              <p>
                We reserve the right to update these terms to reflect evolving regulatory landscapes. Significant changes will be communicated via the platform's primary administrative dashboard.
              </p>
            </div>
          </div>

          {/* Card Meta Footer */}
          <div className="space-y-5 pt-4">
            <Separator className="bg-slate-100" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-300" />
                <span>Last Updated: October 24, 2024</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4.5 w-4.5 text-slate-300" />
                <ShieldCheck className="h-4.5 w-4.5 text-slate-300" />
              </div>
            </div>
          </div>

        </Card>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full bg-login-footer text-white px-6 py-10 md:py-12 lg:py-16 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <img src={footerLogoImg} className="h-8 object-contain" alt="CallBridge Logo" />
            <span className="text-xs font-normal text-slate-400">
              © 2024 CallBridge. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-normal text-slate-400">
            <span className="text-white font-semibold underline decoration-2 underline-offset-4 cursor-default">
              Terms & Privacy Policy
            </span>
            <a href="#support" className="hover:text-white transition">Support Center</a>
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
