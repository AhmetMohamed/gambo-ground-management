import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, CreditCard, Users, Award, MapPin, Clock, Star, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Our <span className="text-gambo">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience world-class facilities and services designed for football enthusiasts of all levels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Ground Booking"
              description="Book our professional football grounds online for your matches and training sessions with just a few clicks."
              icon={<Calendar className="h-8 w-8" />}
              link="/booking"
            />
            <FeatureCard
              title="Premium Training"
              description="Join our premium training programs led by professional coaches to elevate your game to the next level."
              icon={<Award className="h-8 w-8" />}
              link="/premium"
            />
            <FeatureCard
              title="Team Management"
              description="Register your team and manage your players efficiently with our comprehensive team management tools."
              icon={<Users className="h-8 w-8" />}
              link="/teams"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              How It <span className="text-gambo">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Booking a football ground or joining premium training has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gambo text-white flex items-center justify-center font-bold text-xl">1</div>
              <div className="mb-6 w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Date & Time</h3>
              <p className="text-gray-600">Select your preferred date and time slot for booking or training session.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gambo text-white flex items-center justify-center font-bold text-xl">2</div>
              <div className="mb-6 w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Make Payment</h3>
              <p className="text-gray-600">Secure online payment with multiple payment options available.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gambo text-white flex items-center justify-center font-bold text-xl">3</div>
              <div className="mb-6 w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get Confirmation</h3>
              <p className="text-gray-600">Receive instant confirmation and access details via email.</p>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => navigate("/booking")}
              className="bg-gambo hover:bg-gambo-dark text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
            >
              Book Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                World-Class <span className="text-gambo">Facilities</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our state-of-the-art football grounds are designed to provide the best playing experience for all levels of players.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">FIFA Standard Pitches</h3>
                    <p className="text-gray-600">Professional-grade artificial turf that meets international standards.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Floodlit Grounds</h3>
                    <p className="text-gray-600">Play day or night with our high-quality floodlighting system.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 mt-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gambo-muted text-gambo">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Convenient Location</h3>
                    <p className="text-gray-600">Easily accessible with ample parking space for all visitors.</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate("/about")}
                className="mt-8 bg-transparent hover:bg-gambo text-gambo hover:text-white border-2 border-gambo px-6 py-3 rounded-full transition-all duration-300"
              >
                Learn More <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Football Ground" 
                className="rounded-xl shadow-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-gambo-accent" />
                  <Star className="h-5 w-5 text-gambo-accent" />
                  <Star className="h-5 w-5 text-gambo-accent" />
                  <Star className="h-5 w-5 text-gambo-accent" />
                  <Star className="h-5 w-5 text-gambo-accent" />
                </div>
                <p className="font-bold text-gray-800 mt-1">Rated 4.9/5 by our customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              What Our <span className="text-gambo">Customers Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg relative">
              <div className="absolute -top-5 right-5 text-5xl text-gambo-accent opacity-30">"</div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gambo rounded-full flex items-center justify-center text-white font-bold text-xl">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-xl">John Doe</h4>
                  <p className="text-gray-500">Local Club Captain</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 relative z-10">
                "The grounds at Gambo Stadium are always perfectly maintained. The booking process is smooth, and the staff is incredibly friendly and helpful. Best football facility in the area!"
              </p>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg relative">
              <div className="absolute -top-5 right-5 text-5xl text-gambo-accent opacity-30">"</div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gambo rounded-full flex items-center justify-center text-white font-bold text-xl">
                  SM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-xl">Sarah Mitchell</h4>
                  <p className="text-gray-500">Youth Team Coach</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 relative z-10">
                "The premium training program has been a game-changer for our youth team. The professional coaching at affordable rates has significantly improved our players' skills and confidence."
              </p>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg relative">
              <div className="absolute -top-5 right-5 text-5xl text-gambo-accent opacity-30">"</div>
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gambo rounded-full flex items-center justify-center text-white font-bold text-xl">
                  RJ
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-xl">Robert Johnson</h4>
                  <p className="text-gray-500">Regular Customer</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 relative z-10">
                "I've been booking this ground for weekly matches with friends for over a year now. The online booking system makes it so easy, and the quality of the facilities is consistently excellent."
              </p>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
                <Star className="h-5 w-5 text-gambo-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gambo to-gambo-dark text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Book Your Next Match?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join hundreds of satisfied customers who trust Gambo Stadium for their football needs. Book now and experience the difference!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => navigate("/booking")}
              variant="secondary"
              className="bg-gambo hover:bg-gambo-dark text-white px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
            >
              Book Ground <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/premium")}
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-gambo px-8 py-6 text-lg rounded-full transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-xl"
            >
              Explore Premium Training <Award className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
