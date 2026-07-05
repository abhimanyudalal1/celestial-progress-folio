import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create the audio object once on mount
    if (!audioRef.current) {
      audioRef.current = new Audio('/interstellat.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Subtle background volume
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = () => {
    setHasInteracted(true);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Play returns a promise which might reject if user hasn't interacted
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.error("Audio playback failed. The browser might require user interaction first.", e);
          });
      }
    }
  };

  return (
    <div className="fixed top-6 right-6 md:top-6 md:right-10 z-50 flex items-center gap-4">
      {/* Tooltip text */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 2, duration: 1 }}
            className="text-xs font-medium text-gray-800 dark:text-gray-200 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-500/20 dark:border-white/20 pointer-events-none"
          >
            music for the vibes
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        className="p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 backdrop-blur-md border border-black/20 dark:border-white/20 transition-all text-black dark:text-white shadow-lg flex items-center justify-center opacity-40 hover:opacity-100 dark:opacity-20 dark:hover:opacity-100"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause background music" : "Play background music"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}

        {/* Small pulsing ring when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border border-gray-500/50 dark:border-white/50 animate-ping opacity-20 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}

export default BackgroundMusic;
