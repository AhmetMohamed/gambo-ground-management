import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Clock, Award, User } from "lucide-react";

interface DashboardSummaryProps {
  bookingsCount: number;
  upcomingBooking?: {
    groundName: string;
    date: string;
    startTime: string;
  };
  hasPremiumTeam: boolean;
  premiumDetails?: {
    package: string;
    coach: string;
    nextSession: string;
  };
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  bookingsCount,
  upcomingBooking,
  hasPremiumTeam,
  premiumDetails,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bookingsCount}</div>
          <p className="text-xs text-muted-foreground">
            {bookingsCount > 0 ? "You have active bookings" : "No bookings yet"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Booking</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {upcomingBooking ? (
            <>
              <div className="text-2xl font-bold">
                {upcomingBooking.groundName}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(upcomingBooking.date).toLocaleDateString()} at{" "}
                {upcomingBooking.startTime}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">No upcoming</div>
              <p className="text-xs text-muted-foreground">
                Book your next session
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Premium Status</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {hasPremiumTeam ? "Active" : "Not Enrolled"}
          </div>
          <p className="text-xs text-muted-foreground">
            {hasPremiumTeam
              ? `${premiumDetails?.package} with ${premiumDetails?.coach}`
              : "Join premium training"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Active</div>
          <p className="text-xs text-muted-foreground">
            Your account is in good standing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
