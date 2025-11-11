"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import SkyToggle from './sky-toggle';

export function MiniNavbar() {
  const { isDarkMode } = useTheme();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinksData = [
    { label: 'Home', to: '/' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'Projects', to: '/grid-view' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:fixed md:top-2 md:left-1/2 md:transform md:-translate-x-1/2 md:flex md:items-center md:gap-16 md:z-50 md:px-10 md:py-1.5 relative"
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => {
          setIsNavHovered(false);
          setHoveredIndex(null);
        }}
      >
        {/* Navbar Container Outline - appears on hover */}
        <div 
          className={`absolute inset-0 border transition-opacity duration-500 pointer-events-none ${
            isNavHovered ? 'opacity-100' : 'opacity-0'
          } ${isDarkMode ? 'border-gray-800/40' : 'border-white/30'}`}
          style={{
            borderStyle: 'dashed',
            borderWidth: '1.5px',
            borderRadius: '9999px',
          }}
        />

        {/* Navigation Links */}
        {navLinksData.map((link, index) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative font-bold text-lg tracking-wide transition-all duration-300 z-10 px-6 py-3 ${
              isDarkMode ? 'text-gray-700' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Orbital outline on individual button hover */}
            {hoveredIndex === index && (
              <div 
                className={`absolute inset-0 border rounded-full transition-opacity duration-300 pointer-events-none ${
                  isDarkMode ? 'border-gray-800/50' : 'border-white/40'
                }`}
                style={{
                  borderStyle: 'dashed',
                  borderWidth: '1px',
                  transform: 'scale(1.1)',
                }}
              />
            )}

            {/* Glow effect on hover
            {hoveredIndex === index && (
              <>
                <span className={`absolute inset-0 blur-sm animate-pulse ${
                  isDarkMode ? 'bg-gray-900 opacity-1' : 'bg-white opacity-10'
                }`}></span>
                <span className={`absolute inset-0 blur-sm animate-pulse ${
                  isDarkMode ? 'bg-gray-900 opacity-1' : 'bg-white opacity-10'
                }`}></span>
              </>
            )} */}
            
            {/* Text */}
            <span 
              className={`relative transition-all duration-300 ${
                hoveredIndex === index 
                  ? isDarkMode 
                    ? 'text-gray-900 drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]'
                    : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                  : isDarkMode ? 'text-gray-700' : 'text-gray-300'
              }`}
            >
              {link.label}
            </span>

            {/* Star dot on hover */}
            {hoveredIndex === index && (
              <span className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-pulse ${
                isDarkMode 
                  ? 'bg-gray-900 shadow-[0_0_6px_rgba(0,0,0,0.5)]'
                  : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]' 
              }`}></span>
            )}
          </Link>
        ))}

        {/* Theme Toggle */}
        <div className="ml-4">
          <SkyToggle />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 transition-colors ${
            isDarkMode ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'
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
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center ${
          isDarkMode ? 'bg-white/95' : 'bg-black/95'
        }`}>
          <nav className="flex flex-col items-center gap-8">
            {navLinksData.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-bold text-xl transition-colors ${
                  isDarkMode ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4">
              <SkyToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}