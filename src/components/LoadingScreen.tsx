import { useEffect, useState } from "react";
import { Logo } from "./ui/logo";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden">
      {/* Simplified floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 1}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative text-center space-y-8 p-8 z-10">
        {/* Clean logo container */}
        <div className="relative">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl animate-float border border-white/40">
            <Logo size="lg" className="mx-auto" />
          </div>
        </div>

        {/* Clean loading text */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg animate-slide-up">
            Restaurant POS
          </h1>
          
          <p className="text-white/90 text-lg font-medium drop-shadow-md animate-fade-in-delayed">
            Loading your professional experience...
          </p>
          
          {/* Simple loading bar */}
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
            <div className="h-full bg-white/80 animate-loading-bar rounded-full"></div>
          </div>
        </div>

        {/* Simple loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/70 rounded-full animate-wave"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;