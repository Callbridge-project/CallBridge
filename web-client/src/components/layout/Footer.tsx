import React from "react";
import { Link } from "react-router-dom";
import { Globe, Share2, Network } from "lucide-react";
import footerLogoImg from "@/assets/images/footer-logo.png";
import footerAndroidLogo from "@/assets/footerandroid.svg"

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  span: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    span: "lg:col-span-2",
    links: [
      { label: "Dashboard", href: "/dashboard-preview" },
      { label: "Analytics", href: "/dashboard-preview" },
      { label: "Security", href: "/policy" },
      { label: "API Docs", href: "/policy" }
    ]
  },
  {
    title: "Company",
    span: "lg:col-span-2",
    links: [
      { label: "About Us", href: "/contact" },
      { label: "Privacy", href: "/policy" },
      { label: "Status", href: "/dashboard-preview" }
    ]
  },
  {
    title: "Support",
    span: "lg:col-span-4",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Support Center", href: "/contact" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="w-full bg-marketing-footer text-white select-none font-sans">
      {/* Upper Row: Main Columns */}
      <div className="w-full px-6 lg:px-16">
        <div className="mx-auto max-w-7xl py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Column 1: Brand Info (Spans 4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <img src={footerLogoImg} className="h-8 object-contain" alt="CallBridge Logo" />
              </Link>
              <p className="text-sm text-marketing-footer-item leading-relaxed max-w-sm">
                The elite communication bridge for telephony synchronization and secure communication tracking.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-4 text-slate-500">
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-marketing-footer-divider hover:border-white/30 hover:text-white transition duration-205">
                  <Globe className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-marketing-footer-divider hover:border-white/30 hover:text-white transition duration-205">
                  <Share2 className="h-4 w-4" />
                </a>
                <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-marketing-footer-divider hover:border-white/30 hover:text-white transition duration-205">
                  <Network className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Mapped Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className={`${section.span} space-y-4`}>
                <h4 className="text-xs uppercase tracking-widest text-marketing-footer-header font-semibold">{section.title}</h4>
                <ul className="space-y-2.5 text-sm text-marketing-footer-item">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="hover:text-white transition duration-200">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Extra button block for Support section */}
                {section.title === "Support" && (
                  <div className="pt-2">
                    <a 
                      href="#"
                      className="inline-flex items-center bg-footer-btn-gradient hover:opacity-90 text-white text-sm font-normal px-6 md:px-8 py-3 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.15)] active:scale-98 transition-all duration-200 h-14"
                    >
                      {/* Inline SVG Android Logo */}
                      <img src={footerAndroidLogo} alt="Android Logo" className="h-4 w-5 mr-2" />
                        <path d="M17.52 11.2c-.07-.07-.15-.1-.24-.1h-1.3c-.09 0-.17.03-.24.1L12 15.02l-3.74-3.82c-.07-.07-.15-.1-.24-.1H6.72c-.09 0-.17.03-.24.1L2.2 15.5c-.07.07-.1.15-.1.24v6.02c0 .09.03.17.1.24l2.12 2.12c.07.07.15.1.24.1h14.88c.09 0 .17-.03.24-.1l2.12-2.12c.07-.07.1-.15.1-.24v-6.02c0-.09-.03-.17-.1-.24l-4.28-4.28z" />
                        <path d="M20 7.8c0-1-.8-1.8-1.8-1.8h-1.4l1.2-2.1c.2-.3.1-.7-.2-.9-.3-.2-.7-.1-.9.2L15.6 5.5c-1.1-.5-2.3-.7-3.6-.7s-2.5.2-3.6.7L7.1 3.2C6.9 2.9 6.5 2.8 6.2 3c-.3.2-.4.6-.2.9L7.2 6H5.8C4.8 6 4 6.8 4 7.8v7.2h16V7.8z" />
                
                      Download APK
                    </a>
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Terms */}
      <div className="w-full border-t border-marketing-footer-divider px-6 lg:px-16 py-6 md:pt-8 md:pb-14">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-marketing-footer-item">
            © 2026 CallBridge. All rights reserved.
          </span>
          <div className="flex items-center gap-6 text-xs text-marketing-footer-item">
            <Link to="/policy" className="hover:text-white transition duration-200">Terms of Service</Link>
            <Link to="/policy" className="hover:text-white transition duration-200">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
