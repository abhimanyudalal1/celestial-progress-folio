import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isDarkMode } = useTheme();
  
  const scaleX = useSpring(scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        scaleX,
        background: isDarkMode 
          ? 'linear-gradient(90deg, #ffffff 0%, #888888 100%)'
          : 'linear-gradient(90deg, #000000 0%, #666666 100%)',
      }}
    />
  );
};

export default ScrollProgress;
