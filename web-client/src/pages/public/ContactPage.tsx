import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Clock, 
  Timer, 
  MessageSquare, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  Smartphone, 
  User, 
  ShieldCheck, 
  Eye, 
  Database,
  Lock,
  ArrowRight,
  Shield,
  LifeBuoy,
  Key,
  Headphones,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Custom UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Local asset mockups
import supportInterfaceImg from "@/assets/images/Support Interface.png";

// SVG Asset Imports for Section 3
import apk from "../../assets/apk.svg";
import login from "../../assets/login.svg";
import publicguide from "../../assets/publicguide.svg";
import troubleshoot from "../../assets/troubleshoot.svg";
import publicconnect from "../../assets/publicconnect.svg";
import publicsms from "../../assets/publicsms.svg";

// ── CONFIGURATIONS FOR MODULAR MAPS ──────────────────────────────────────

const heroBullets = [
  { label: "Fast Response", icon: Timer },
  { label: "Secure Communication", icon: ShieldCheck },
  { label: "Technical Assistance", icon: LifeBuoy },
  { label: "FAQ Support", icon: MessageSquare }
];

const directContactInfo = [
  { label: "EMAIL SUPPORT", value: "callbridge6@gmail.com", icon: Mail },
  { label: "AVAILABILITY", value: "Mon-Fri 8am - 6pm GMT", icon: Headphones },
  { label: "RESPONSE TIME", value: "Between 12 & 24 Hours Guaranteed", icon: Clock }
];

const issuePills = [
  "APK Help",
  "Dashboard Access",
  "Sync",
  "SMS Help",
  "Permission Guide"
];

const topics = [
  {
    icon: apk,
    title: 'APK Help',
    description: 'Step-by-step installation guides and package management for Android devices.',
  },
  {
    icon: login,
    title: 'Login Assistance',
    description: 'Password resets, and account recovery.',
  },
  {
    icon: publicguide,
    title: 'Permissions Guide',
    description: 'Managing accessibility services and system-level permissions for full monitoring.',
  },
  {
    icon: troubleshoot,
    title: 'Troubleshooting',
    description: 'Resolving common sync errors, dashboard mismatches, and network lags.',
  },
  {
    icon: publicconnect,
    title: 'Connection Issues',
    description: 'Improving device synchronization stability.',
  },
  {
    icon: publicsms,
    title: 'SMS Help',
    description: 'Capture and synchronizeencrypted messages through the mobile apps ',
  },
];

const faqs = [
  {
    q: "Is my phone data safe with CallBridge?",
    a: "Yes. CallBridge only reads telephony metadata (numbers, times, contact names). No audio, no location, and no passwords are ever accessed or stored."
  },
  {
    q: "Can I monitor the web dashboard from multiple devices?",
    a: "Yes. Your CallBridge web dashboard is accessible from any browser. The Android app is the monitoring agent; the web is where you view data."
  },
  {
    q: "What happens if my phone loses internet?",
    a: "The app queues events locally and syncs them automatically when the connection is restored. No logs are lost."
  },
  {
    q: "Does CallBridge work on iOS?",
    a: "Not currently. CallBridge is Android-only due to the system-level permissions required for telephony monitoring."
  },
  {
    q: "How do I unlink a device?",
    a: "Go to the Device page in your dashboard and toggle monitoring off. You can also fully remove the device from the account settings."
  }
];

const militaryCards = [
  {
    title: "Secure Monitoring",
    desc: "Communication activity is synchronized securely between the Android app and the dashboard using authenticated connections and Protected APIs.",
    icon: Lock
  },
  {
    title: "Privacy Protection",
    desc: "CallBridge only accesses permissions approved by the user and does not share monitoring data with unauthorized third parties.",
    icon: Eye
  },
  {
    title: "Restricted Access",
    desc: "Only authenticated users can access their personal dashboard and synchronized monitoring records.",
    icon: ShieldCheck
  },
  {
    title: "Data Retention",
    desc: "Immutable blockchain-based logs for all technical administrative interactions.",
    icon: Database
  }
];

export default function ContactPage() {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("High Priority Technical Issue");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  
  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // FAQ State
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  // Section 3 Auto-Scroll State & Hooks
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scrollTopics = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth;

      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (scrollLeft <= 0) {
          scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      scrollTopics('right');
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFAQToggle = (idx: number) => {
    setOpenFAQIndex(openFAQIndex === idx ? null : idx);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Legal Name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!message.trim()) {
      newErrors.message = "Message cannot be empty.";
    } else if (message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters long.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    // Implement exact linear gradient stop values: 0% F9F9FF, 50% E8EEFF, 87% 46546B, 100% 0B1B35
    <div 
      className={`min-h-screen flex flex-col justify-between transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #E8EEFF 50%, #46546B 87%, #0B1B35 100%)"
      }}
    >
      <Navbar />

      {/* ── SECTION 1: HERO SECTION ────────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 lg:pt-36 relative overflow-hidden py-16 lg:py-24 flex-1"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F1F3FF 50%, #E8EEFF 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] border border-[#D5E1FF] px-4 py-1.5 text-m-xs font-semibold uppercase tracking-wider text-primary select-none">
              <Shield className="h-3.5 w-3.5" />
              SUPPORT & COMMUNICATION HUB
            </div>
            
            <h1 className="text-4xl md:text-5.5xl lg:text-6xl font-bold text-marketing-dark leading-tight tracking-tight">
              Need Help? We're<br />
              <span className="text-primary">Here for You.</span>
            </h1>
            
            <p className="text-base text-marketing-light font-normal leading-relaxed max-w-xl">
              Whether it's technical assistance or specific monitoring inquiries, our specialist team ensures your CallBridge experience remains fluid and secure.
            </p>
            
            {/* Quick Contact Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {heroBullets.map((bullet) => {
                const Icon = bullet.icon;
                return (
                  <div key={bullet.label} className="flex items-center gap-2.5 text-left text-marketing-dark select-none">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-m-xs font-semibold">{bullet.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Support Graphic image */}
          <div className="lg:col-span-6 flex justify-center items-center select-none">
            <img 
              src={supportInterfaceImg} 
              className="max-h-[460px] object-contain select-none pointer-events-none" 
              alt="Support Hub Interface Graphic" 
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: CONTACT FORM & DIRECT CONTACT CARD ──────────────── */}
      {/* Background Gradient Stops from Mockup 1: 0% E8EEFF, 100% FFFFFF */}
      <section 
        className="w-full px-6 lg:px-16 py-16 lg:py-24"
        style={{
          background: "linear-gradient(180deg, #E8EEFF 0%, #FFFFFF 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: Reach directly styled exactly to Figma parameters */}
          <div 
            className="lg:col-span-5 rounded-[24px] p-10 shadow-badge-blue flex flex-col justify-between text-left space-y-8 animate-in fade-in slide-in-from-left duration-500"
            style={{
              background: "linear-gradient(135deg, #0A0A1A 0%, #1A3A6B 100%)"
            }}
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white tracking-tight">Rather reach us directly?</h3>
              
              <div className="space-y-6 pt-2">
                {directContactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.label} className="flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-[12px] bg-white/5 flex items-center justify-center border border-white/10 shrink-0 text-white animate-pulse-slow">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest leading-none">{info.label}</p>
                        <p className="text-sm font-semibold text-white mt-1">{info.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">COMMON ISSUES</p>
              <div className="flex flex-wrap gap-2">
                {issuePills.map((tag) => (
                  <span key={tag} className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-default select-none">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <a href="#faq-section" className="inline-flex items-center text-m-xs font-semibold text-white hover:underline gap-1.5 select-none">
                  Check our FAQs <ArrowRight className="h-3.5 w-3.5 text-slate-300 animate-bounce-horizontal" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Panel: Send Us a Message Form Card */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[32px] p-8 p-10 lg:px-16  lg:py-16 shadow-badge-blue text-left flex flex-col justify-center">
            {isSuccess ? (
              // Success Screen
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
                <h3 className="text-xl font-semibold text-marketing-dark">Message Received!</h3>
                <p className="text-marketing-light text-m-xs font-normal max-w-sm leading-relaxed">
                  Your support request was generated and encrypted successfully. A technical representative will respond to your corporate address within 24 hours.
                </p>
                <button 
                  onClick={() => {
                    setIsSuccess(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                    setFileName("");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-m-xs font-bold px-6 py-2.5 rounded-full transition duration-200"
                >
                  Send another message
                </button>
              </div>
            ) : (
              // Contact Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-marketing-dark tracking-tight">Send Us a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <Input 
                    type="text" 
                    placeholder="Full Name"
                    label="Legal Name"
                    labelPlacement="outside"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    className="h-12 w-full rounded-full  border border-globalborder/80 pl-5 font-semibold focus-within:border-primary text-marketing-dark focus-within:bg-white"
                  />

                  {/* Email Input */}
                  <Input 
                    type="email" 
                    placeholder="user@company.com"
                    label="Corporate Email"
                    labelPlacement="outside"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    className="h-12 w-full rounded-full  border border-globalborder/80 pl-5 font-semibold focus-within:border-primary text-marketing-dark focus-within:bg-white"
                  />
                </div>

                {/* Priority Select */}
                <div className="flex flex-col w-full">
                  <span className="mb-2 text-sm font-medium text-gray-900" style={{ letterSpacing: '-0.8px' }}>
                    Priority Subject
                  </span>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-12 w-full rounded-full  border border-globalborder/80 pl-5 font-semibold focus:ring-0 text-marketing-dark focus:bg-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High Priority Technical Issue">High Priority Technical Issue</SelectItem>
                      <SelectItem value="Account Problem">Account Problem</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Detailed Message Textarea */}
                <Textarea 
                  placeholder="Provide system logs or specific error codes..."
                  label="Detailed Message"
                  labelPlacement="outside"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  error={errors.message}
                  className="w-full text-marketing-dark"
                  textareaClassName=" border border-globalborder/80 pl-5 rounded-2xl p-4 min-h-[120px] focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus:border-primary text-marketing-dark font-semibold focus:bg-white"
                />

                {/* Attachments drag zone */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-550">Attachments</label>
                  <div 
                    onClick={triggerFileSelect}
                    className="border border-dashed border-globalborder/80 rounded-3xl p-5 py-8 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-slate-400" />
                    <p className="text-m-xs font-semibold text-marketing-dark">
                      {fileName ? `Selected: ${fileName}` : "Upload error logs or UI screenshots (Encrypted)"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Images or documents up to 5MB</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.txt"
                    />
                  </div>
                </div>

                {/* Submit button (Linear Gradient Stops: 0% 005EA1, 100% 0B1B35) */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white font-semibold h-14 rounded-full transition duration-200 flex items-center justify-center gap-2 select-none hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(90deg, #005EA1 0%, #0B1B35 100%)"
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Encrypting Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: BROWSE BY TOPIC ─────────────────────────────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header with Scroll Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center w-full">
              <h2 className="text-3xl font-semibold text-marketing-dark tracking-tight">
                We solve all the following and more
              </h2>
              <p className="text-marketing-light text-sm font-normal mx-auto max-w-md">
                Instant solutions for every technical layer of the CallBridge ecosystem.
              </p>
            </div>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollTopics('left')}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-marketing-dark hover:bg-slate-50 transition-colors shadow-sm"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollTopics('right')}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-marketing-dark hover:bg-slate-50 transition-colors shadow-sm"
                aria-label="Scroll Right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Carousel Scroll Container */}
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 text-left"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topics.map((item, index) => (
              <div
                key={index}
                className="w-full md:w-[calc(50%-12px)] shrink-0 snap-start bg-white border-l-4 border-l-primary border border-slate-100/80 rounded-r-[32px] rounded-l-[4px] p-8 flex items-start gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <img src={item.icon} alt={item.title} className="h-5 w-5 object-contain" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold text-marketing-dark">{item.title}</h4>
                  <p className="text-xs text-marketing-light leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 4: Technical Intelligence FAQ ───────────────────────── */}
      <section id="faq-section" className="w-full px-6 lg:px-16 py-20 bg-white/95">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-marketing-dark tracking-tight">Technical Intelligence FAQ</h2>
            <p className="text-marketing-light text-sm font-normal">
              Everything you need to know about CallBridge.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFAQIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 shadow-badge-blue"
                >
                  <button
                    onClick={() => handleFAQToggle(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-marketing-dark hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-left text-m-xs font-normal text-marketing-light leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 5: Military-Grade Communication (Flat #0B1B35) ────────── */}
      <section className="w-full px-6 lg:px-16 py-20 bg-[#0B1B35] text-white">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-white tracking-tight">Military-Grade Communication</h2>
            <p className="text-slate-300 text-sm font-normal max-w-xl mx-auto leading-relaxed">
              Your privacy is non-negotiable. All support interactions are handled through hardware-accelerated encrypted tunnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {militaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-[#152238]/40 border border-[#2B78BF]/20 rounded-[28px] p-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">{card.title}</h4>
                  <p className="text-m-xs text-muted-foreground font-normal leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 6: Still Need Expert Assistance? (180deg #0B1B35 to #000000) */}
      <section 
        className="w-full px-6 lg:px-16 py-24 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0B1B35 0%, #000000 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Glassmorphic card itself using HSL 209 63 46 at 10% opacity, white border 10% opacity, corner radius 48px */}
          <div 
            className="w-full backdrop-blur-md rounded-[48px] p-12 lg:p-20 text-center relative overflow-hidden shadow-lg border"
            style={{
              backgroundColor: "rgba(43, 120, 191, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Glow Blobs */}
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Still Need Expert Assistance?</h2>
              <p className="text-slate-300 text-sm font-normal max-w-sm mx-auto leading-relaxed opacity-90">
                Our specialized engineering team is ready to assist with custom implementation or high-security deployments.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a 
                  href="mailto:callbridge6@gmail.com"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#005EA1] font-semibold py-3.5 px-8 rounded-full shadow-md text-sm transition-all"
                >
                  Contact Specialized Support
                </a>
                <a 
                  href="#faq-section"
                  className="w-full sm:w-auto bg-transparent border border-white hover:bg-white/5 text-white font-semibold py-3.5 px-8 rounded-full shadow-sm text-sm transition-all"
                >
                  Return to Main FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}