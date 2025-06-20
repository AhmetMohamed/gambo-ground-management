import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Calendar } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      {/* Hero background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 animate-[pulse_15s_ease-in-out_infinite]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
          backgroundPosition: "center",
        }}
      ></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>

      {/* Content */}
      <div className="container mx-auto px-4 py-28 md:py-40 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 bg-gambo-accent text-black rounded-full text-sm font-semibold mb-6 animate-bounce">
            New Premium Training Packages Available
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Experience </span>
            <span className="text-gambo-accent">Professional</span>
            <span className="text-white"> Football Grounds</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl">
            Book our state-of-the-art facilities for matches, training sessions, and events. 
            Join our community of passionate football players today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/booking")}
              className="bg-gambo hover:bg-gambo-dark text-white px-8 py-6 text-lg rounded-full group transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
            >
              Book Ground
              <Calendar className="ml-2 h-5 w-5 group-hover:animate-pulse" />
            </Button>
            <Button
              onClick={() => navigate("/premium")}
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-gambo px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
            >
              Premium Training
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold text-gambo-accent">5+</p>
              <p className="text-sm text-gray-300">Professional Fields</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold text-gambo-accent">10k+</p>
              <p className="text-sm text-gray-300">Happy Customers</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold text-gambo-accent">15+</p>
              <p className="text-sm text-gray-300">Pro Coaches</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-3xl font-bold text-gambo-accent">24/7</p>
              <p className="text-sm text-gray-300">Online Booking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
