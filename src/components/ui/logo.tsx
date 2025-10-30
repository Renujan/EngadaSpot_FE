import { useBusinessInfo } from "@/contexts/BusinessContext";
import spotLogo from "@/assets/spot-logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  showText = true, 
  size = 'md' 
}) => {
  const { businessInfo } = useBusinessInfo();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={businessInfo.logoUrl || spotLogo} 
        alt={`${businessInfo.shopName} Logo`}
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-primary ${textSizeClasses[size]}`}>
          {businessInfo.shopName}
        </span>
      )}
    </div>
  );
};