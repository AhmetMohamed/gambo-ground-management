import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Activity } from "lucide-react";
import { format } from "date-fns";
import { fetchBookings, fetchUsers } from "@/services/adminService";

export default function AdminBookingsPage() {
  // Remove this line:
  // const [currentPage, setCurrentPage] = useState("Booking");
  
  const [bookingFilter, setBookingFilter] = useState("all");

  // Fetch bookings data
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  // Fetch users data for displaying user names
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = booking.date ? new Date(booking.date) : null;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    switch (bookingFilter) {
      case "today":
        return bookingDate && 
          bookingDate.getDate() === today.getDate() &&
          bookingDate.getMonth() === today.getMonth() &&
          bookingDate.getFullYear() === today.getFullYear();
      case "thisWeek":
        return bookingDate && bookingDate >= startOfWeek && bookingDate <= today;
      case "pending":
        return booking.status === "pending";
      case "confirmed":
        return booking.status === "confirmed";
      default:
        return true;
    }
  });

  // Handle export data
  const handleExportData = () => {
    // Implementation for exporting booking data to CSV
    console.log("Exporting booking data...");
  };

  return (
    <AdminLayout>
      {/* Your page content */}
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-8">Bookings Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>
              View and manage all ground bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading bookings data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                  <Badge
                    variant={bookingFilter === "all" ? "default" : "outline"}
                    className={bookingFilter === "all" ? "bg-gambo text-white cursor-pointer" : "cursor-pointer"}
                    onClick={() => setBookingFilter("all")}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={bookingFilter === "today" ? "default" : "outline"}
                    className={bookingFilter === "today" ? "bg-gambo text-white cursor-pointer" : "cursor-pointer"}
                    onClick={() => setBookingFilter("today")}
                  >
                    Today
                  </Badge>
                  <Badge
                    variant={bookingFilter === "thisWeek" ? "default" : "outline"}
                    className={bookingFilter === "thisWeek" ? "bg-gambo text-white cursor-pointer" : "cursor-pointer"}
                    onClick={() => setBookingFilter("thisWeek")}
                  >
                    This Week
                  </Badge>
                  <Badge
                    variant={bookingFilter === "pending" ? "default" : "outline"}
                    className={bookingFilter === "pending" ? "bg-gambo text-white cursor-pointer" : "cursor-pointer"}
                    onClick={() => setBookingFilter("pending")}
                  >
                    Pending
                  </Badge>
                  <Badge
                    variant={bookingFilter === "confirmed" ? "default" : "outline"}
                    className={bookingFilter === "confirmed" ? "bg-gambo text-white cursor-pointer" : "cursor-pointer"}
                    onClick={() => setBookingFilter("confirmed")}
                  >
                    Confirmed
                  </Badge>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-6 bg-muted p-3 rounded-t-md font-medium text-sm">
                    <div>User</div>
                    <div>Ground</div>
                    <div>Date</div>
                    <div>Time</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Status</div>
                  </div>

                  <div>
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking, index) => {
                        // Find the user who made this booking
                        const bookingUser = users.find(
                          (user) => user.id === booking.userId
                        );

                        return (
                          <div
                            key={booking.id}
                            className={`grid grid-cols-6 p-3 items-center ${
                              index < filteredBookings.length - 1 ? "border-b" : ""
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {bookingUser?.name || booking.userName || "Unknown"}
                            </div>
                            <div className="text-sm">{booking.groundName}</div>
                            <div className="text-sm">
                              {booking.date
                                ? format(new Date(booking.date), "MMM d, yyyy")
                                : "N/A"}
                            </div>
                            <div className="text-sm">
                              {booking.startTime || "N/A"} - {booking.endTime || "N/A"}
                            </div>
                            <div className="text-center font-medium">
                              ${booking.price}
                            </div>
                            <div className="flex justify-center">
                              <Badge
                                variant="outline"
                                className={`${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                }`}
                              >
                                {booking.status === "confirmed" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Activity className="h-3 w-3 mr-1" />
                                )}
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No bookings found matching the selected filter
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
            <Button className="bg-gambo hover:bg-gambo-dark">
              Add Manual Booking
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}