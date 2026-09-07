import { Github, Linkedin, Mail } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Identity overlay for the 3D flight.
 *
 * These used to be <text> and <circle> nodes inside the solar system's SVG, sized
 * off the viewBox. With a real 3D scene there is no SVG to live in, and putting
 * them in the scene would mean SDF text that fights the camera for legibility — so
 * they sit in the DOM above the canvas instead, which is also simply better type.
 *
 * The tour fades this out on departure (see Index), because from then on the frame
 * belongs to the milestone cards.
 */

const SOCIALS = [
  { Icon: Github, href: "https://github.com/abhimanyudalal1", label: "GitHub" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
  { Icon: Mail, href: "mailto:suraj.dalal122@gmail.com", label: "Email" },
];

const Hero = () => {
  const { isDarkMode } = useTheme();
  // Inverted polarity, as everywhere on this page: isDarkMode === false is space mode
  const fg = isDarkMode ? "#000000" : "#ffffff";
  const muted = isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";

  return (
    <header className="absolute inset-0 z-20 pointer-events-none flex items-center">
      <div className="pl-[8vw] md:pl-[10vw] max-w-[46ch] flex flex-col gap-5">
        <p
          className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em]"
          style={{ color: muted }}
        >
          The path so far
        </p>

        <h1
          className="font-bold tracking-tight leading-[0.95] drop-shadow-md"
          style={{ color: fg, fontSize: "clamp(3rem, 8vw, 7rem)" }}
        >
          Abhimanyu
        </h1>

        <p
          className="font-light drop-shadow-sm"
          style={{ color: muted, fontSize: "clamp(1rem, 1.7vw, 1.5rem)" }}
        >
          Machine Learning Engineer
        </p>

        <div className="flex gap-3 mt-2 pointer-events-auto">
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={label}
              className="flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition-transform hover:scale-110"
              style={{
                borderColor: isDarkMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)",
                color: fg,
              }}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Hero;
