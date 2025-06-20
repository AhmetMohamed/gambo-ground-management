import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { saveBooking, getAllBookings } from "../services/apiService";

// Import images
import mainStadiumImg from "../Assets/main-stadium.jpg";
import trainingGroundAImg from "../Assets/training-ground-a.jpg";
import trainingGroundBImg from "../Assets/training-ground-b.jpg";

// Define available grounds
const grounds = [
  {
    id: "ground1",
    name: "Main Stadium",
    image: mainStadiumImg,
    images: [
      mainStadiumImg,
      trainingGroundAImg,
      trainingGroundBImg,
    ],
    price: 60,
    description: "Professional football stadium with seating for spectators",
    currency: "USD",
  },
  {
    id: "ground2",
    name: "Training Ground A",
    image: trainingGroundAImg,
    images: [
      trainingGroundAImg,
      mainStadiumImg,
      trainingGroundBImg,
    ],
    price: 20,
    description: "Standard training ground with basic facilities",
    currency: "USD",
  },
  {
    id: "ground3",
    name: "Training Ground B",
    image: trainingGroundBImg,
    images: [
      trainingGroundBImg,
      mainStadiumImg,
      trainingGroundAImg,
    ],
    price: 40,
    description: "Premium training ground with advanced facilities",
    currency: "USD",
  },
];

// Define available time slots
const timeSlots = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedGround, setSelectedGround] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    [key: string]: number;
  }>({});

  // Fetch existing bookings when component mounts
  // Fetch bookings when component mounts or when selectedGround or selectedDate changes
  useEffect(() => {
    getAllBookings()
      .then((bookings) => {
        if (bookings && bookings.length > 0) {
          setBookedSlots(bookings);
        }
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  }, []);
  
  // Refresh bookings when ground or date selection changes
  useEffect(() => {
    if (selectedGround || selectedDate) {
      getAllBookings()
        .then((bookings) => {
          if (bookings && bookings.length > 0) {
            setBookedSlots(bookings);
          }
        })
        .catch((error) => {
          console.error("Error refreshing bookings:", error);
        });
    }
  }, [selectedGround, selectedDate]);

  const nextImage = (groundId: string, imagesLength: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [groundId]: ((prev[groundId] || 0) + 1) % imagesLength,
    }));
  };

  const prevImage = (groundId: string, imagesLength: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [groundId]: ((prev[groundId] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const handleGroundSelect = (groundId: string) => {
    setSelectedGround(groundId);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedTimeSlot(slot);
  };

  const nextStep = () => {
    if (step === 1 && !selectedGround) {
      toast.error("Please select a ground");
      return;
    }

    if (step === 2 && (!selectedDate || !selectedTimeSlot)) {
      toast.error("Please select both date and time");
      return;
    }

    if (step === 3 && !contactEmail) {
      toast.error("Please provide contact email");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) {
      toast.error("Please provide contact email");
      return;
    }
    nextStep();
  };

  // Handle booking submit
  const handleBookingSubmit = () => {
    if (
      !selectedGround ||
      !selectedDate ||
      !selectedTimeSlot ||
      !contactEmail
    ) {
      toast.error("Please complete all required fields");
      return;
    }
  
    // Check if the selected slot is already booked
    const isSlotBooked = bookedSlots.some(
      (booking) =>
        booking.date === format(selectedDate, "yyyy-MM-dd") &&
        booking.startTime === selectedTimeSlot.start &&
        booking.endTime === selectedTimeSlot.end &&
        booking.groundName ===
          grounds.find((g) => g.id === selectedGround)?.name &&
        booking.status !== "cancelled"
    );
  
    if (isSlotBooked) {
      toast.error("This slot is already booked. Please select another time.");
      setStep(2);
      return;
    }
  
    const selectedGroundDetails = grounds.find((g) => g.id === selectedGround);
  
    if (!selectedGroundDetails) {
      toast.error("Invalid ground selection");
      return;
    }
  
    const bookingData = {
      groundId: selectedGround, // Ensure groundId is included
      groundName: selectedGroundDetails.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: selectedTimeSlot.start,
      endTime: selectedTimeSlot.end,
      price: selectedGroundDetails.price,
      contactEmail,
      specialRequests,
      status: "confirmed",
    };
  
    console.log("Submitting booking with data:", bookingData); // Debug log
  
    saveBooking(bookingData)
      .then((newBooking) => {
        // Add the new booking to the bookedSlots array
        setBookedSlots([...bookedSlots, newBooking]);
        toast.success("Booking confirmed successfully!");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error saving booking:", error);
        toast.error(`Failed to confirm booking: ${error.message || 'Please try again'}`);
      });
  };

  const isTimeSlotBooked = (slot: { start: string; end: string }) => {
    if (!selectedDate) return false;

    return bookedSlots.some(
      (booking) =>
        booking.date === format(selectedDate, "yyyy-MM-dd") &&
        booking.startTime === slot.start &&
        booking.endTime === slot.end &&
        booking.groundName ===
          grounds.find((g) => g.id === selectedGround)?.name &&
        booking.status !== "cancelled"
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Book a Ground</h1>

      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((num) => (
            <>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= num ? "bg-gambo text-white" : "bg-gray-200"
                }`}
              >
                {num}
              </div>
              {num < 4 && (
                <div
                  className={`w-16 h-1 ${
                    step > num ? "bg-gambo" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </>
          ))}
        </div>
      </div>
      {/* Step 1: Select Ground */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select a Ground</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {grounds.map((ground) => (
              <Card
                key={ground.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedGround === ground.id ? "ring-2 ring-gambo" : ""
                }`}
                onClick={() => handleGroundSelect(ground.id)}
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img
                    src={ground.images[currentImageIndex[ground.id] || 0]}
                    alt={ground.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = mainStadiumImg;
                    }}
                  />
                  {/* Image navigation buttons */}
                  <div className="absolute inset-0 flex items-center justify-between p-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-white/70 hover:bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        prevImage(ground.id, ground.images.length);
                      }}
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-white/70 hover:bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        nextImage(ground.id, ground.images.length);
                      }}
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </Button>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-lg">{ground.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {ground.description}
                  </p>
                  <p className="font-semibold text-gambo">
                    ${ground.price} {ground.currency} per hour
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={nextStep}>Next: Select Date & Time</Button>
          </div>
        </div>
      )}
      {/* Step 2: Select Date and Time */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose a Date</h3>
              <div className="border rounded-md p-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Choose a Time Slot</h3>
              <div className="border rounded-md p-2">
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const isBooked = isTimeSlotBooked(slot);
                    return (
                      <Button
                        key={`${slot.start}-${slot.end}`}
                        variant={
                          selectedTimeSlot === slot ? "default" : "outline"
                        }
                        className={cn(
                          "justify-start mx-2",
                          isBooked && 
                            "bg-red-100 text-gray-400 cursor-not-allowed opacity-60 line-through",
                          selectedTimeSlot === slot &&
                            !isBooked && "bg-gambo hover:bg-gambo/90"
                        )}
                        onClick={() => !isBooked && handleTimeSlotSelect(slot)}
                        disabled={isBooked}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {slot.start} - {slot.end}
                        {isBooked && " (Unavailable)"}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextStep}>Next: Contact Information</Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {step === 3 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="special-requests">
                Special Requests (Optional)
              </Label>
              <Textarea
                id="special-requests"
                placeholder="Any special requirements or notes for your booking"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button type="submit">Next: Confirm Booking</Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Confirm Booking */}
      {step === 4 && (
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Confirm Your Booking</h2>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ground:</span>
                  <span className="font-medium">
                    {grounds.find((g) => g.id === selectedGround)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">
                    {selectedTimeSlot?.start} - {selectedTimeSlot?.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-medium text-gambo">
                    ${grounds.find((g) => g.id === selectedGround)?.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact Email:</span>
                  <span className="font-medium">{contactEmail}</span>
                </div>
                {specialRequests && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Special Requests:</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {specialRequests}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={handleBookingSubmit}
              className="bg-gambo hover:bg-gambo/90"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
