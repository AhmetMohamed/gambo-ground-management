import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserProfile,
  getUserBookings,
  getUserPremiumTeams,
  saveBooking,
  getAllCoaches,
} from "../../services/apiService";
import api from "../../services/apiService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  CheckCircle,
  User,
  Calendar as CalendarIcon,
  CreditCard,
  Award,
  AlertTriangle,
  Activity,
  BarChart,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditProfileDialog from "@/components/EditProfileDialog";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import TrainingDetailsDialog from "@/components/TrainingDetailsDialog";
import ChangeTrainingDayDialog from "@/components/ChangeTrainingDayDialog";
import ContactCoachDialog from "@/components/ContactCoachDialog";
import DashboardSummary from "@/components/DashboardSummary";

const trainingDaysOptions = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

interface BookingType {
  id: string;
  userId?: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
}

interface PremiumTrainingType {
  _id?: string;
  package: string;
  coach: string;
  coachImage?: string;
  trainingDays: string[];
  players: { name: string; age: string }[];
  nextSession: string;
  sessionsRemaining: number;
  status: "active" | "cancelled" | "pending";
  endDate: string;
  userId?: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [premiumTraining, setPremiumTraining] =
    useState<PremiumTrainingType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(
    null
  );
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [trainingDetailsOpen, setTrainingDetailsOpen] = useState(false);
  const [changeTrainingDayOpen, setChangeTrainingDayOpen] = useState(false);
  const [contactCoachOpen, setContactCoachOpen] = useState(false);
  // Add missing state variables
  const [isLoading, setIsLoading] = useState(false);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if no token
      navigate("/login");
      return;
    }

    setIsLoading(true);

    // Get user profile from token
    getUserProfile()
      .then((userData) => {
        if (userData) {
          setUser(userData);

          // Fetch user bookings
          getUserBookings().then((userBookings) => {
            if (userBookings.length > 0) {
              setBookings(userBookings);
              setIsNewUser(false);

              // Generate activity data based on bookings
              const activities = userBookings.map((booking) => ({
                type: "booking",
                date: new Date(booking.date),
                title: `Booked ${booking.groundName}`,
                description: `${booking.startTime} - ${booking.endTime}`,
                status: booking.status,
              }));
              setActivityData(activities);
            } else {
              setIsNewUser(true);
            }
          });

          // Fetch premium teams
          getUserPremiumTeams().then((teams) => {
            if (teams.length > 0) {
              const team = teams[0];
              setPremiumTraining({
                package: team.package,
                coach: team.coach,
                trainingDays: team.trainingDays,
                players: team.players,
                nextSession: calculateNextSession(team.trainingDays),
                sessionsRemaining: calculateRemainingSessionsFromPackage(
                  team.package
                ),
                status: "active",
                endDate: team.endDate,
                userId: team.userId,
              });
              setIsNewUser(false);

              // Add premium team activity
              setActivityData((prev) => [
                ...prev,
                {
                  type: "premium",
                  date: new Date(team.startDate),
                  title: `Enrolled in ${team.package}`,
                  description: `Coach: ${team.coach}`,
                  status: "active",
                },
              ]);
            }
          });

          // Fetch real coaches
          getAllCoaches().then((coachData) => {
            if (coachData.length > 0) {
              setCoaches(coachData);
            }
          });
        } else {
          toast.error("Failed to load user data");
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user data", err);
        toast.error("Error loading user data");
        setIsLoading(false);
      });
  }, []);

  // Helper function to calculate next session date based on training days
  const calculateNextSession = (trainingDays) => {
    if (!trainingDays || trainingDays.length === 0)
      return new Date().toISOString().split("T")[0];

    const dayMap = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };

    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert training days to day numbers
    const trainingDayNumbers = trainingDays.map((day) => dayMap[day]);

    // Find the next training day
    let nextDay = trainingDayNumbers.find((day) => day > currentDay);
    if (nextDay === undefined) {
      // If no days are greater than current day, take the first day of next week
      nextDay = trainingDayNumbers[0];
    }

    // Calculate days to add
    const daysToAdd =
      nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

    // Create the next session date
    const nextSession = new Date(today);
    nextSession.setDate(today.getDate() + daysToAdd);

    return nextSession.toISOString().split("T")[0];
  };

  // Helper function to calculate remaining sessions based on package
  const calculateRemainingSessionsFromPackage = (packageName) => {
    if (packageName.includes("Basic")) return 4; // 1 session per week for 4 weeks
    if (packageName.includes("Premium")) return 8; // 2 sessions per week for 4 weeks
    if (packageName.includes("Elite")) return 12; // 3 sessions per week for 4 weeks
    return 8; // Default
  };

  const handleProfileDialogChange = (open: boolean) => {
    setProfileDialogOpen(open);

    if (!open) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  };

  const handleViewBookingDetails = (booking: BookingType) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };

  const handleCancelPremiumTraining = () => {
    if (premiumTraining && premiumTraining._id) {
      // Call the API to cancel the membership
      api
        .patch(`/premiumTeams/cancel/${premiumTraining._id}`)
        .then((response) => {
          // Update local state with the cancelled status
          const updatedTraining: PremiumTrainingType = {
            ...premiumTraining,
            status: "cancelled" as const,
          };
          setPremiumTraining(updatedTraining);
          toast.success("Premium training program cancelled successfully");
        })
        .catch((error) => {
          console.error("Error cancelling premium training:", error);
          toast.error("Failed to cancel premium training. Please try again.");
        });
    } else {
      // Fallback to local storage update if no _id is available
      const updatedTraining: PremiumTrainingType = {
        ...premiumTraining!,
        status: "cancelled" as const,
      };
      setPremiumTraining(updatedTraining);

      localStorage.setItem("premiumTraining", JSON.stringify(updatedTraining));

      const allPremiumData = localStorage.getItem("all_premiumTeams");
      if (allPremiumData && user) {
        try {
          const allTeams = JSON.parse(allPremiumData);

          const updatedTeams = allTeams.map((team: any) =>
            team.userId === user.id ? { ...team, status: "cancelled" } : team
          );

          localStorage.setItem(
            "all_premiumTeams",
            JSON.stringify(updatedTeams)
          );
        } catch (e) {
          console.error("Error updating all_premiumTeams", e);
        }
      }

      toast.success("Premium training program cancelled successfully");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Banner */}
      <div className="bg-gambo rounded-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome, {user?.name || "User"}!
            </h1>
            <p className="text-gambo-light">
              Manage your bookings and premium training sessions
            </p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-white text-gambo hover:bg-gray-100"
            onClick={() => setProfileDialogOpen(true)}
          >
            <User className="mr-2 h-4 w-4" /> Update Password
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gambo"></div>
        </div>
      ) : (
        <>
          <DashboardSummary
            bookingsCount={bookings.length}
            upcomingBooking={bookings.find(
              (b) => new Date(b.date) >= new Date()
            )}
            hasPremiumTeam={premiumTraining !== null}
            premiumDetails={premiumTraining}
          />

          <div className="mt-8">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="training">Premium Training</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="mr-2 h-5 w-5 text-gambo" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activityData.length > 0 ? (
                          <div className="space-y-4">
                            {activityData
                              .sort(
                                (a, b) => b.date.getTime() - a.date.getTime()
                              )
                              .slice(0, 5)
                              .map((activity, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                                >
                                  <div
                                    className={`p-2 rounded-full ${
                                      activity.type === "booking"
                                        ? "bg-blue-100"
                                        : "bg-amber-100"
                                    }`}
                                  >
                                    {activity.type === "booking" ? (
                                      <Calendar className="h-5 w-5 text-blue-600" />
                                    ) : (
                                      <Award className="h-5 w-5 text-amber-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {activity.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {format(
                                        new Date(activity.date),
                                        "MMM d, yyyy"
                                      )}
                                    </p>
                                  </div>
                                  <div className="ml-auto">
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        activity.status === "confirmed" ||
                                        activity.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : activity.status === "pending"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {activity.status.charAt(0).toUpperCase() +
                                        activity.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No recent activity</p>
                          </div>
                        )}
                      </CardContent>
                      {activityData.length > 0 && (
                        <CardFooter>
                          <Button variant="ghost" className="w-full text-gambo">
                            View All Activity
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart className="mr-2 h-5 w-5 text-gambo" />
                          Usage Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Bookings This Month
                            </p>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gambo"
                                style={{
                                  width: `${Math.min(
                                    bookings.length * 10,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {bookings.length} bookings
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              Premium Training
                            </p>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500"
                                style={{
                                  width: premiumTraining ? "100%" : "0%",
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {premiumTraining
                                ? `${premiumTraining.package} active`
                                : "No active training"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">
                              Account Completion
                            </p>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "80%" }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              80% complete
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5 text-gambo" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link to="/booking">
                              <Calendar className="mr-2 h-4 w-4" />
                              Book a Ground
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link to="/premium">
                              <Award className="mr-2 h-4 w-4" />
                              Join Premium Training
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setProfileDialogOpen(true)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Update Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-gambo" />
                      My Bookings
                    </CardTitle>
                    <CardDescription>
                      View and manage your ground bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div>
                              <h3 className="font-medium">
                                {booking.groundName}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <CalendarIcon className="mr-1 h-4 w-4" />
                                {format(new Date(booking.date), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="mr-1 h-4 w-4" />
                                {booking.startTime} - {booking.endTime}
                              </div>
                            </div>
                            <div className="flex items-center mt-3 md:mt-0">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewBookingDetails(booking)
                                }
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <Calendar className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No bookings found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          You haven't made any ground bookings yet.
                        </p>
                        <Button asChild>
                          <Link to="/booking">Book a Ground</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="training" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-gambo" />
                      Premium Training
                    </CardTitle>
                    <CardDescription>
                      Manage your premium training program
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {premiumTraining ? (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-gray-50">
                          <div>
                            <h3 className="font-medium">
                              {premiumTraining.package}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <User className="mr-1 h-4 w-4" />
                              <div className="flex items-center gap-2">
                                {premiumTraining.coachImage ? (
                                  <div className="h-6 w-6 rounded-full overflow-hidden">
                                    <img
                                      src={premiumTraining.coachImage}
                                      alt={`Coach ${premiumTraining.coach}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : null}
                                Coach: {premiumTraining.coach}
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              Next Session:{" "}
                              {format(
                                new Date(premiumTraining.nextSession),
                                "MMM d, yyyy"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center mt-3 md:mt-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                premiumTraining.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : premiumTraining.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {premiumTraining.status.charAt(0).toUpperCase() +
                                premiumTraining.status.slice(1)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTrainingDetailsOpen(true)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Sessions Remaining
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {premiumTraining.sessionsRemaining}
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                <div
                                  className="h-full bg-gambo"
                                  style={{
                                    width: `${
                                      (premiumTraining.sessionsRemaining /
                                        calculateRemainingSessionsFromPackage(
                                          premiumTraining.package
                                        )) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Training Days
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1">
                                {premiumTraining.trainingDays.map((day) => (
                                  <span
                                    key={day}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                              <Button
                                variant="link"
                                className="text-xs p-0 h-auto mt-2 text-gambo"
                                onClick={() => setChangeTrainingDayOpen(true)}
                              >
                                Change training days
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">
                                Coach Contact
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                onClick={() => setContactCoachOpen(true)}
                              >
                                Contact Coach
                              </Button>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            onClick={handleCancelPremiumTraining}
                          >
                            Cancel Training Program
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <Award className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No premium training
                        </h3>
                        <p className="text-gray-500 mb-4">
                          You haven't registered for any premium training
                          program yet.
                        </p>
                        <Button asChild>
                          <Link to="/premium-training">
                            Join Premium Training
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {/* Dialogs */}
      <EditProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        user={user}
        passwordOnly={true}
      />

      <BookingDetailsDialog
        open={bookingDetailsOpen}
        onOpenChange={setBookingDetailsOpen}
        booking={selectedBooking}
      />

      <TrainingDetailsDialog
        open={trainingDetailsOpen}
        onOpenChange={setTrainingDetailsOpen}
        training={premiumTraining}
      />

      <ChangeTrainingDayDialog
        open={changeTrainingDayOpen}
        onOpenChange={setChangeTrainingDayOpen}
        currentDays={
          premiumTraining?.trainingDays
            .map((day) => {
              // Convert full day names to day IDs
              const dayMap = {
                Monday: "mon",
                Tuesday: "tue",
                Wednesday: "wed",
                Thursday: "thu",
                Friday: "fri",
                Saturday: "sat",
                Sunday: "sun",
              };
              return dayMap[day] || "";
            })
            .filter((id) => id !== "") || []
        }
      />

      <ContactCoachDialog
        open={contactCoachOpen}
        onOpenChange={setContactCoachOpen}
        coachName={premiumTraining?.coach || ""}
        coachImage={premiumTraining?.coachImage}
      />
    </div>
  );
};

export default UserDashboard;
