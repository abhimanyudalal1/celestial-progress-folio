import { useState, useRef, useEffect } from 'react';

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro = ({ onComplete }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set muted to ensure autoplay works
      video.muted = true;
      video.play().catch((error) => {
        console.error('Error playing video:', error);
        // If autoplay fails, skip to the website
        onComplete();
      });
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsPlaying(false);
    onComplete();
  };

  if (!isPlaying) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onEnded={handleVideoEnd}
        playsInline
        muted
        autoPlay
      >
        <source src="/wdl2.mov" type="video/quicktime" />
        <source src="/wdl2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-300 border border-white/30"
      >
        Skip Intro
      </button>
    </div>
  );
};

export default VideoIntro;
