import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageName]);

  const navLinks = [
    { name: "Portfolio", page: "Portfolio" },
    { name: "Capabilities", page: "Capabilities" },
    { name: "Process", page: "Process" },
    { name: "About", page: "About" },
    { name: "Contact", page: "Contact" },
  ];

  const isHome = currentPageName === "Home";

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap');
        
        :root {
          --color-cream: #FAF9F7;
          --color-warm-gray: #6B6B6B;
          --color-charcoal: #2D2D2D;
          --color-gold: #C4A962;
          --color-light-gray: #E8E6E3;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--color-cream);
        }
        
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }
      `}</style>

      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-[#FAF9F7]/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="relative z-10">
              <h1 className={`font-serif text-2xl font-medium tracking-wide transition-colors duration-300 ${
                scrolled || !isHome ? "text-[#2D2D2D]" : "text-white"
              }`}>
                Crafted By Design Co.
              </h1>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-[#C4A962] ${
                    scrolled || !isHome ? "text-[#6B6B6B]" : "text-white/90"
                  } ${currentPageName === link.page ? "text-[#C4A962]" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[#E8E6E3]">
                <a
                  href="https://www.instagram.com/craftedbydesignco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-300 hover:text-[#C4A962] ${
                    scrolled || !isHome ? "text-[#6B6B6B]" : "text-white/90"
                  }`}
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/CraftedbyDesignCo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-300 hover:text-[#C4A962] ${
                    scrolled || !isHome ? "text-[#6B6B6B]" : "text-white/90"
                  }`}
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://craftedxdesignco.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs tracking-widest uppercase font-medium px-4 py-2 rounded-full border transition-all duration-300 ${
                    scrolled || !isHome
                      ? "border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
                      : "border-white text-white hover:bg-white hover:text-[#2D2D2D]"
                  }`}
                >
                  Etsy Shop
                </a>
              </div>

              {isAdmin && (
                <Link
                  to={createPageUrl("Admin")}
                  className={`text-xs tracking-widest uppercase transition-colors duration-300 hover:text-[#C4A962] ${
                    scrolled || !isHome ? "text-[#C4A962]" : "text-[#C4A962]"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${
                scrolled || !isHome ? "text-[#2D2D2D]" : "text-white"
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#FAF9F7] border-t border-[#E8E6E3]"
            >
              <div className="px-6 py-8 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm tracking-widest uppercase text-[#6B6B6B] hover:text-[#C4A962] transition-colors ${
                      currentPageName === link.page ? "text-[#C4A962]" : ""
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="pt-6 border-t border-[#E8E6E3] flex items-center gap-6">
                  <a
                    href="https://www.instagram.com/craftedbydesignco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B6B6B] hover:text-[#C4A962] transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/CraftedbyDesignCo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B6B6B] hover:text-[#C4A962] transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://craftedxdesignco.etsy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-widest uppercase font-medium px-4 py-2 rounded-full border border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-all"
                  >
                    Etsy Shop
                  </a>
                </div>

                {isAdmin && (
                  <Link
                    to={createPageUrl("Admin")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs tracking-widest uppercase text-[#C4A962]"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#2D2D2D] text-white py-16 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-medium mb-4">Crafted By Design Co.</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Custom laser-cut and engraved designs, handcrafted in New Jersey.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs tracking-widest uppercase mb-4 text-white/40">Quick Links</h4>
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className="block text-sm text-white/60 hover:text-[#C4A962] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs tracking-widest uppercase mb-4 text-white/40">Connect</h4>
              <div className="space-y-3">
                <a
                  href="https://craftedxdesignco.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/60 hover:text-[#C4A962] transition-colors"
                >
                  Etsy Shop
                </a>
                <a
                  href="https://www.instagram.com/craftedbydesignco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/60 hover:text-[#C4A962] transition-colors"
                >
                  Follow on Instagram
                </a>
                <a
                  href="https://www.facebook.com/CraftedbyDesignCo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-white/60 hover:text-[#C4A962] transition-colors"
                >
                  Follow on Facebook
                </a>
                <a
                  href="mailto:craftedxdesignco@gmail.com"
                  className="block text-sm text-white/60 hover:text-[#C4A962] transition-colors"
                >
                  craftedxdesignco@gmail.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Crafted By Design Co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}