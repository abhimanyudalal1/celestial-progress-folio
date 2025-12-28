import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const { isDarkMode } = useTheme();
  
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 64,
  };
  
  const dimension = sizeMap[size];
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className="rounded-full border-2"
        style={{
          width: dimension,
          height: dimension,
          borderColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.1)' 
            : 'rgba(255, 255, 255, 0.1)',
          borderTopColor: isDarkMode ? '#000000' : '#ffffff',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <p 
          className="text-sm font-medium"
          style={{
            color: isDarkMode ? '#000000' : '#ffffff',
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: isDarkMode ? '#ffffff' : '#000000',
      }}
    >
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
};

export default LoadingSpinner;
