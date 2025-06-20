import { useState } from "react";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, Award, BarChart3 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { 
  exportUsersToCSV, 
  exportBookingsToCSV, 
  exportOverallToCSV,
  exportOverallToPDF,
  fetchUsers, 
  fetchBookings, 
  fetchPremiumTeams
} from "@/services/adminService";
import {
  getUserStatistics,
  getRevenueAnalytics,
  getTeamAnalytics
} from "@/services/apiService";
import { useQuery } from "@tanstack/react-query";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("bookings");
  const [reportFormat, setReportFormat] = useState("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch data
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const { data: premiumTeams = [] } = useQuery({
    queryKey: ["premiumTeams"],
    queryFn: fetchPremiumTeams,
  });

  // Handle report generation
  const handleGenerateReport = (type: string) => {
    switch (type) {
      case "users":
        if (users.length === 0) {
          toast.error("No user data available");
          return;
        }
        if (reportFormat === "csv") {
          exportUsersToCSV(users);
        } else if (reportFormat === "pdf") {
          // For PDF, we'll use the overall PDF function with just user data
          exportOverallToPDF(users, [], []);
        } else {
          toast.error("Invalid report format");
          return;
        }
        toast.success("User report generated successfully");
        break;
      case "bookings":
        if (bookings.length === 0) {
          toast.error("No booking data available");
          return;
        }
        if (reportFormat === "csv") {
          exportBookingsToCSV(bookings);
        } else if (reportFormat === "pdf") {
          // For PDF, we'll use the overall PDF function with just booking data
          exportOverallToPDF([], bookings, []);
        } else {
          toast.error("Invalid report format");
          return;
        }
        toast.success("Booking report generated successfully");
        break;
      case "premium":
        if (premiumTeams.length === 0) {
          toast.error("No premium team data available");
          return;
        }
        
        if (reportFormat === "csv") {
          // Create a custom CSV for premium teams
          const headers = ["ID", "Coach", "Package", "Start Date", "End Date", "Training Days", "Players"];
          let csvContent = headers.join(",") + "\n";

          premiumTeams.forEach((team) => {
            const row = [
              team.id || team._id || 'N/A', // Use id or _id property
              team.coach,
              team.package,
              team.startDate,
              team.endDate,
              team.trainingDays.join(" | "),
              team.players.map(p => `${p.name} (${p.age})`).join(" | ")
            ];

            // Escape any fields with commas
            const escapedRow = row.map((field) => {
              const str = String(field);
              return str.includes(",") ? `"${str}"` : str;
            });

            csvContent += escapedRow.join(",") + "\n";
          });

          // Create and trigger download
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute(
            "download",
            `premium-teams-export-${new Date().toISOString().split("T")[0]}.csv`
          );
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (reportFormat === "pdf") {
          // For PDF, we'll use the overall PDF function with just premium team data
          exportOverallToPDF([], [], premiumTeams);
        } else {
          toast.error("Invalid report format");
          return;
        }
        
        toast.success("Premium teams report generated successfully");
        break;
      case "overall":
        // Check if we have data for at least one category
        if (users.length === 0 && bookings.length === 0 && premiumTeams.length === 0) {
          toast.error("No data available for overall report");
          return;
        }
        
        // Generate the overall report using the exportOverallToCSV function
        if (reportFormat === "csv") {
          exportOverallToCSV(users, bookings, premiumTeams);
        } else if (reportFormat === "pdf") {
          exportOverallToPDF(users, bookings, premiumTeams);
        } else {
          toast.error("Invalid report format");
          return;
        }
        
        toast.success("Overall report generated successfully");
        break;
      default:
        toast.error("Invalid report type");
    }
  };

  // Handle custom report generation
  const handleGenerateCustomReport = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Filter data based on date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error("Start date must be before end date");
      return;
    }

    let filteredData;
    switch (reportType) {
      case "users":
        filteredData = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= start && createdAt <= end;
        });
        if (filteredData.length === 0) {
          toast.error("No user data available for the selected date range");
          return;
        }
        exportUsersToCSV(filteredData);
        break;
      case "bookings":
        filteredData = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= start && bookingDate <= end;
        });
        if (filteredData.length === 0) {
          toast.error("No booking data available for the selected date range");
          return;
        }
        exportBookingsToCSV(filteredData);
        break;
      case "premium":
        filteredData = premiumTeams.filter(team => {
          const teamStartDate = new Date(team.startDate);
          return teamStartDate >= start && teamStartDate <= end;
        });
        if (filteredData.length === 0) {
          toast.error("No premium team data available for the selected date range");
          return;
        }
        // Use the same CSV generation as above for premium teams
        const headers = ["ID", "Coach", "Package", "Start Date", "End Date", "Training Days", "Players"];
        let csvContent = headers.join(",") + "\n";

        filteredData.forEach((team) => {
          const row = [
            team.id,
            team.coach,
            team.package,
            team.startDate,
            team.endDate,
            team.trainingDays.join(" | "),
            team.players.map(p => `${p.name} (${p.age})`).join(" | ")
          ];

          // Escape any fields with commas
          const escapedRow = row.map((field) => {
            const str = String(field);
            return str.includes(",") ? `"${str}"` : str;
          });

          csvContent += escapedRow.join(",") + "\n";
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `premium-teams-export-${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      case "overall":
        // Filter all data types by date range
        const filteredUsers = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= start && createdAt <= end;
        });
        
        const filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= start && bookingDate <= end;
        });
        
        const filteredTeams = premiumTeams.filter(team => {
          const teamStartDate = new Date(team.startDate);
          return teamStartDate >= start && teamStartDate <= end;
        });
        
        // Check if we have any data after filtering
        if (filteredUsers.length === 0 && filteredBookings.length === 0 && filteredTeams.length === 0) {
          toast.error("No data available for the selected date range");
          return;
        }
        
        // Generate the overall report with filtered data based on format
        if (reportFormat === "csv") {
          exportOverallToCSV(filteredUsers, filteredBookings, filteredTeams);
        } else if (reportFormat === "pdf") {
          exportOverallToPDF(filteredUsers, filteredBookings, filteredTeams);
        } else {
          toast.error("Invalid report format");
          return;
        }
        break;
      default:
        toast.error("Invalid report type");
        return;
    }

    toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
  };

  return (
    <AdminLayout>
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-8">Reports and Analytics</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-gambo" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  User registration and engagement metrics
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleGenerateReport("users")}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gambo" />
                  Booking Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Booking patterns and revenue analysis
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleGenerateReport("bookings")}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-gambo" />
                  Premium Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Premium program performance and enrollment
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleGenerateReport("premium")}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gambo" />
                  Overall Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Comprehensive report with all key metrics
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleGenerateReport("overall")}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Custom Report</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select 
                      value={reportType} 
                      onValueChange={setReportType}
                    >
                      <SelectTrigger id="report-type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bookings">Bookings</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="premium">Premium Programs</SelectItem>
                        <SelectItem value="overall">Overall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Report Format</Label>
                    <Select 
                      value={reportFormat} 
                      onValueChange={setReportFormat}
                    >
                      <SelectTrigger id="report-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input 
                      id="start-date" 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

            <Button 
              className="bg-gambo hover:bg-gambo-dark w-full"
              onClick={handleGenerateCustomReport}
            >
              Generate Custom Report
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}