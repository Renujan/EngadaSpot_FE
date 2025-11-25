import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    toast({
      title: "Page Not Found",
      description: `The page "${location.pathname}" does not exist. Redirecting to dashboard...`,
      variant: "destructive",
    });
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
    toast({
      title: "Redirecting",
      description: "Taking you back to the dashboard...",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={handleGoHome} className="hover-glow">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
