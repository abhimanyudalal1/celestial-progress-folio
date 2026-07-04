"use client";

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useTransition } from '@/contexts/TransitionContext';
import SkyToggle from './ui/sky-toggle';

export type NavbarViewMode = 'default' | 'projects';

interface DynamicNavbarProps {
  viewMode?: NavbarViewMode;
}

export function DynamicNavbar({ viewMode = 'default' }: DynamicNavbarProps) {
  const { isDarkMode } = useTheme();
  const { startTransition } = useTransition();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine view mode based on current route if not explicitly set
  const currentViewMode = location.pathname === '/grid-view' ? 'projects' : viewMode;
  const isProjectsMode = currentViewMode === 'projects';

  // Navigation links change based on mode
  const defaultLinks = [
    { label: 'Home', to: '/' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Projects', to: '/grid-view' },
    { label: 'About', to: '/about' },
  ];

  const projectsLinks = [
    { label: 'Abhimanyu', to: '/', isName: true },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Projects', to: '/grid-view', isActive: true },
    { label: 'About', to: '/about' },
  ];

  const navLinks = isProjectsMode ? projectsLinks : defaultLinks;

  // Sun gradient colors for projects mode
  const sunGradient = 'linear-gradient(90deg, #F59E0B, #EF4444, #F59E0B)';
  // Moon gradient for dark mode
  const moonGradient = 'linear-gradient(90deg, #E2E8F0, #94A3B8, #E2E8F0)';
  const moonTextClass = 'bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent font-black text-lg drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]';

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className="hidden md:fixed md:top-2 md:left-1/2 md:transform md:-translate-x-1/2 md:flex md:items-center md:gap-16 md:z-50 md:px-10 md:py-1.5 relative"
        initial={false}
        animate={{
          backgroundColor: isProjectsMode ? (isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)') : 'transparent',
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => {
          setIsNavHovered(false);
          setHoveredIndex(null);
        }}
        style={{
          borderRadius: '9999px',
          backdropFilter: isProjectsMode ? 'blur(12px)' : 'blur(4px)',
          WebkitBackdropFilter: isProjectsMode ? 'blur(12px)' : 'blur(4px)',
        }}
      >
        {/* Glassy background */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'
            }`}
          style={{
            borderRadius: '9999px',
          }}
        />



        {/* Sun/Moon-themed gradient border for projects mode */}
        <AnimatePresence>
          {isProjectsMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none inset-0 rounded-full"
              style={{
                padding: '1.5px',
                background: isDarkMode ? moonGradient : sunGradient,
                backgroundSize: '200% 100%',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                animation: 'shimmer 3s linear infinite',
                borderRadius: '9999px',
                filter: isDarkMode ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))' : 'none'
              }}
            >
              <style>{`
              @keyframes shimmer {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
              }
            `}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover outline */}
        <div
          className={`absolute inset-0 border transition-opacity duration-500 pointer-events-none ${isNavHovered ? 'opacity-100' : 'opacity-0'
            } ${isProjectsMode ? (isDarkMode ? 'border-white/30' : 'border-gray-800/40') : (isDarkMode ? 'border-gray-800/40' : 'border-white/30')}`}
          style={{
            borderStyle: 'dashed',
            borderWidth: '1.5px',
            borderRadius: '9999px',
          }}
        />

        {/* Navigation Links */}
        <AnimatePresence mode="wait">
          {navLinks.map((link, index) => (
            <motion.div
              key={`${link.to}-${link.label}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Link
                to={link.to}
                onClick={(e) => {
                  if (link.to === '/grid-view' && location.pathname === '/') {
                    e.preventDefault();
                    startTransition();
                  }
                }}
                className={`relative font-bold text-lg tracking-wide transition-all duration-300 z-10 px-6 py-3 block ${isProjectsMode ? (isDarkMode ? 'text-gray-300' : 'text-gray-700') : (isDarkMode ? 'text-gray-700' : 'text-gray-300')
                  }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover ring */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="navHover"
                    className={`absolute inset-0 border rounded-full pointer-events-none ${isProjectsMode
                        ? (isDarkMode ? 'border-white/40' : 'border-gray-800/50')
                        : (isDarkMode ? 'border-gray-800/50' : 'border-white/40')
                      }`}
                    style={{
                      borderStyle: 'dashed',
                      borderWidth: '1px',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Text with special styling for name */}
                <span
                  className={`relative transition-all duration-300 ${hoveredIndex === index
                    ? isProjectsMode
                      ? (isDarkMode ? 'text-white' : 'text-gray-900')
                      : (isDarkMode ? 'text-gray-900' : 'text-white')
                    : isDarkMode ? 'text-gray-700' : 'text-gray-300'
                    } ${(link as any).isName
                      ? isDarkMode
                        ? moonTextClass
                        : 'bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent font-black text-lg'
                      : ''
                    } ${(link as any).isActive
                      ? 'text-white'
                      : ''
                    }`}
                >
                  {link.label}
                </span>

                {/* Active indicator dot */}
                {(link as any).isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: isDarkMode ? moonGradient : sunGradient }}
                  />
                )}

                {/* Hover star dot */}
                {hoveredIndex === index && !(link as any).isActive && (
                  <span className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse ${isProjectsMode
                      ? (isDarkMode ? 'bg-white' : 'bg-gray-900')
                      : (isDarkMode ? 'bg-gray-900' : 'bg-white')
                    }`} />
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Theme Toggle */}
        <div className="ml-4">
          <SkyToggle />
        </div>
      </motion.nav >

      {/* Mobile Navigation */}
      < div className="md:hidden fixed top-4 right-4 z-50" >
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-3 rounded-full backdrop-blur-md transition-colors ${isDarkMode
            ? 'text-gray-700 bg-white/10 hover:bg-white/20'
            : 'text-gray-300 bg-black/20 hover:bg-black/40'
            }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div >

      {/* Mobile Menu */}
      <AnimatePresence>
        {
          isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center ${isDarkMode ? 'bg-white/95' : 'bg-black/95'
                }`}
            >


              <nav className="flex flex-col items-center gap-8 relative z-10">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        if (link.to === '/grid-view' && location.pathname === '/') {
                          e.preventDefault();
                          startTransition();
                        }
                      }}
                      className={`text-3xl font-bold transition-colors ${(link as any).isName
                        ? isDarkMode
                          ? moonTextClass
                          : 'bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent font-black text-lg'
                        : isProjectsMode
                          ? (isDarkMode ? 'text-gray-800 hover:text-white' : 'text-gray-200 hover:text-black')
                          : (isDarkMode ? 'text-gray-800 hover:text-black' : 'text-gray-200 hover:text-white')
                        }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Theme toggle in mobile menu */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="mt-4"
                >
                  <SkyToggle />
                </motion.div>
              </nav>
            </motion.div>
          )
        }
      </AnimatePresence >
    </>
  );
}

export default DynamicNavbar;
