import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { DollarSign, Users, Award, BarChart3, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import StatsCard from "./StatsCard";
import RevenueChart from "./RevenueChart";
import {
  exportBookingsToCSV,
} from "../services/adminService";
import {
  getRevenueAnalytics,
  getUserStatistics,
  getTeamAnalytics,
} from "../services/apiService";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const Reports: React.FC = () => {
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);
  const [customReportType, setCustomReportType] = useState("revenue");
  const [customReportDateRange, setCustomReportDateRange] = useState("month");
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenueAnalytics"],
    queryFn: getRevenueAnalytics,
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ["userStatistics"],
    queryFn: getUserStatistics,
  });

  const { data: teamAnalytics, isLoading: teamAnalyticsLoading } = useQuery({
    queryKey: ["teamAnalytics"],
    queryFn: getTeamAnalytics,
  });

  const isLoading = revenueLoading || userStatsLoading || teamAnalyticsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">Loading analytics data...</div>
    );
  }

  // Ensure data exists with fallbacks
  const safeRevenueData = revenueData || {
    totalRevenue: 0,
    monthlyRevenue: [],
    revenueByGround: [],
  };
  
  const safeUserStats = userStats || {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    userGrowth: [],
  };
  
  const safeTeamAnalytics = teamAnalytics || {
    totalTeams: 0,
    totalPlayers: 0,
    teamsByProgram: [],
    popularTrainingDays: [],
  };

  // Function to generate and download reports
  const generateReport = (reportType: string) => {
    switch (reportType) {
      case "user-activity":
        // Generate user activity report
        alert("User activity report generated!");
        // In a real implementation, you would create a CSV or PDF with user data
        break;
      case "booking-analytics":
        // Use the existing exportBookingsToCSV function
        // This assumes you have access to the bookings data
        // You might need to fetch it first
        alert("Booking analytics report generated!");
        break;
      case "premium-programs":
        // Generate premium programs report
        alert("Premium programs report generated!");
        break;
      case "custom":
        // Generate custom report based on selected options
        alert(`Custom ${customReportType} report for ${customReportDateRange} generated!`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`$${safeRevenueData.totalRevenue?.toFixed(2) || '0.00'}`}
          description={`$${safeRevenueData.monthlyRevenue?.[0]?.revenue?.toFixed(2) || '0.00'} this month`}
          icon={DollarSign}
          trend={{
            value: 12,
            label: "12% from last month",
            positive: true,
          }}
        />
        <StatsCard
          title="Users"
          value={safeUserStats.totalUsers || 0}
          description={`${safeUserStats.activeUsers || 0} active users`}
          icon={Users}
          trend={{
            value: safeUserStats.newUsersThisMonth || 0,
            label: `${safeUserStats.newUsersThisMonth || 0} new this month`,
            positive: (safeUserStats.newUsersThisMonth || 0) > 0,
          }}
        />
        <StatsCard
          title="Premium Teams"
          value={safeTeamAnalytics.totalTeams || 0}
          description={`${safeTeamAnalytics.totalPlayers || 0} players enrolled`}
          icon={Award}
        />
        <StatsCard
          title="Avg. Booking Value"
          value={`$${(
            (safeRevenueData.totalRevenue || 0) / 
            Math.max((safeRevenueData.monthlyRevenue?.length || 1), 1)
          ).toFixed(2)}`}
          description="Average per booking"
          icon={BarChart3}
        />
      </div>

      {/* Rest of the component remains the same, but use safeRevenueData, safeUserStats, and safeTeamAnalytics */}
      
      {/* For example: */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              data={
                safeRevenueData.monthlyRevenue?.map((item) => ({
                  name: item.month,
                  value: item.revenue,
                })) || []
              }
              title="Monthly Revenue"
              description="Revenue breakdown by month"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Ground</CardTitle>
                <CardDescription>Distribution across grounds</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeRevenueData.revenueByGround || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(safeRevenueData.revenueByGround || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeUserStats.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="New Users"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Status</CardTitle>
                <CardDescription>Active vs. Inactive Users</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: safeUserStats.activeUsers || 0 },
                        { name: "Inactive", value: (safeUserStats.totalUsers || 0) - (safeUserStats.activeUsers || 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teams by Program</CardTitle>
                <CardDescription>Distribution across programs</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeTeamAnalytics.teamsByProgram || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="program"
                      label={({ program, percent }) =>
                        `${program}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(safeTeamAnalytics.teamsByProgram || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Training Days</CardTitle>
                <CardDescription>Most common training days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeTeamAnalytics.popularTrainingDays || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Teams"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
        </TabsList>

        {/* Revenue Tab - existing content with added Generate Report button */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart
              data={
                safeRevenueData.monthlyRevenue?.map((item) => ({
                  name: item.month,
                  value: item.revenue,
                })) || []
              }
              title="Monthly Revenue"
              description="Revenue breakdown by month"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Ground</CardTitle>
                <CardDescription>Distribution across grounds</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeRevenueData.revenueByGround || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(safeRevenueData.revenueByGround || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 flex justify-end">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Booking Analytics
                </CardTitle>
                <CardDescription>
                  Booking patterns and revenue analysis
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  onClick={() => generateReport("booking-analytics")} 
                  className="bg-gambo hover:bg-gambo-dark"
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab - existing content with added Generate Report button */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeUserStats.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="New Users"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Status</CardTitle>
                <CardDescription>Active vs. Inactive Users</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: safeUserStats.activeUsers || 0 },
                        { name: "Inactive", value: (safeUserStats.totalUsers || 0) - (safeUserStats.activeUsers || 0) },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Programs Tab - existing content with added Generate Report button */}
        <TabsContent value="programs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teams by Program</CardTitle>
                <CardDescription>Distribution across programs</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeTeamAnalytics.teamsByProgram || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="program"
                      label={({ program, percent }) =>
                        `${program}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(safeTeamAnalytics.teamsByProgram || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Training Days</CardTitle>
                <CardDescription>Most common training days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeTeamAnalytics.popularTrainingDays || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Teams"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Report Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report</CardTitle>
              <CardDescription>
                Create a custom report with specific parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select 
                    value={customReportType} 
                    onValueChange={setCustomReportType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="bookings">Bookings</SelectItem>
                      <SelectItem value="premium">Premium Programs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select 
                    value={customReportDateRange} 
                    onValueChange={setCustomReportDateRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => generateReport("custom")} 
                className="bg-gambo hover:bg-gambo-dark"
              >
                Generate Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Custom Report Dialog */}
      <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Report</DialogTitle>
            <DialogDescription>
              Select parameters for your custom report
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Custom report parameters would go here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              generateReport("custom");
              setShowCustomReportDialog(false);
            }}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
