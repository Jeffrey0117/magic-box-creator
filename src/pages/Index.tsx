import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
