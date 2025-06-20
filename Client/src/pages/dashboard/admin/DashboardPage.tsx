import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  Award,
  DollarSign,
  TrendingUp,
  UserPlus,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  fetchUsers,
  fetchBookings,
  fetchPremiumTeams,
} from "@/services/adminService";
import {
  getUserStatistics,
  getRevenueAnalytics,
  getTeamAnalytics,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month"); // "week", "month", "year"

  // Fetch data using React Query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const { data: premiumTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["premiumTeams"],
    queryFn: fetchPremiumTeams,
  });

  const {
    data: userStats = {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userGrowth: [],
    },
    isLoading: userStatsLoading,
  } = useQuery({
    queryKey: ["userStatistics"],
    queryFn: getUserStatistics,
  });

  const {
    data: revenueStats = {
      totalRevenue: 0,
      monthlyRevenue: [],
      revenueByGround: [],
    },
    isLoading: revenueStatsLoading,
  } = useQuery({
    queryKey: ["revenueAnalytics"],
    queryFn: getRevenueAnalytics,
  });

  const {
    data: teamStats = {
      totalTeams: 0,
      totalPlayers: 0,
      teamsByProgram: [],
      popularTrainingDays: [],
    },
    isLoading: teamStatsLoading,
  } = useQuery({
    queryKey: ["teamAnalytics"],
    queryFn: getTeamAnalytics,
  });

  // Calculate dashboard statistics
  const totalUsers = userStats?.totalUsers || users?.length || 0;
  const activeUsers =
    userStats?.activeUsers || users?.filter((user) => user.active)?.length || 0;
  const totalBookings = bookings?.length || 0;
  const confirmedBookings =
    bookings?.filter((booking) => booking.status === "confirmed")?.length || 0;
  const totalTeams = teamStats?.totalTeams || premiumTeams?.length || 0;
  const totalPlayers = teamStats?.totalPlayers || 0;
  const totalRevenue = revenueStats?.totalRevenue || 0;

  // Calculate recent bookings
  const recentBookings = [...(bookings || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate recent users
  const recentUsers = [...(users || [])]
    .filter((user) => user.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100; // If previous was 0, show 100% growth
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get previous month data for comparison
  const previousMonthUsers = userStats?.userGrowth?.[1]?.users || 0;
  const currentMonthUsers = userStats?.userGrowth?.[0]?.users || 0;
  const userGrowthPercent = calculateGrowth(
    currentMonthUsers,
    previousMonthUsers
  );

  const previousMonthRevenue = revenueStats?.monthlyRevenue?.[1]?.revenue || 0;
  const currentMonthRevenue = revenueStats?.monthlyRevenue?.[0]?.revenue || 0;
  const revenueGrowthPercent = calculateGrowth(
    currentMonthRevenue,
    previousMonthRevenue
  );

  // Prepare chart data
  const userGrowthData = userStats?.userGrowth || [];
  const revenueData = revenueStats?.monthlyRevenue || [];
  const bookingStatusData = [
    {
      name: "Confirmed",
      value: bookings?.filter((b) => b.status === "confirmed")?.length || 0,
    },
    {
      name: "Pending",
      value: bookings?.filter((b) => b.status === "pending")?.length || 0,
    },
    {
      name: "Cancelled",
      value: bookings?.filter((b) => b.status === "cancelled")?.length || 0,
    },
  ];

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const STATUS_COLORS = {
    confirmed: "#00C49F",
    pending: "#FFBB28",
    cancelled: "#FF8042",
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
              size="sm"
            >
              Month
            </Button>
            <Button
              variant={timeRange === "year" ? "default" : "outline"}
              onClick={() => setTimeRange("year")}
              size="sm"
            >
              Year
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="teams">Premium Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <div className="flex items-center pt-1">
                    <span className="text-xs text-muted-foreground mr-2">
                      {activeUsers} active users
                    </span>
                    {userGrowthPercent > 0 ? (
                      <span className="text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {userGrowthPercent}%
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        {Math.abs(userGrowthPercent)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {confirmedBookings} confirmed bookings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Premium Teams
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeams}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalPlayers} registered players
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <div className="flex items-center pt-1">
                    <span className="text-xs text-muted-foreground mr-2">
                      This {timeRange}
                    </span>
                    {revenueGrowthPercent > 0 ? (
                      <span className="text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {revenueGrowthPercent}%
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        {Math.abs(revenueGrowthPercent)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Revenue Chart - Wider */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <XAxis
                          dataKey="month"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Revenue"]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#0088FE"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowthData}>
                        <XAxis
                          dataKey="month"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status Chart */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{booking.groundName}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.userName} •{" "}
                              {format(new Date(booking.date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "secondary" // Changed from "success" to "secondary"
                                : booking.status === "pending"
                                ? "default" // Changed from "warning" to "default"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No recent bookings
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  Detailed user statistics and growth trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                >
                  View All Users
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
                <CardDescription>
                  Booking trends and status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {bookingStatusData.map((entry, index) => (
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
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Bookings</h3>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{booking.groundName}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.userName} •{" "}
                              {format(new Date(booking.date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "secondary" // Changed from "success" to "secondary"
                                : booking.status === "pending"
                                ? "default" // Changed from "warning" to "default"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No recent bookings
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/booking")}
                >
                  View All Bookings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Premium Teams Analytics</CardTitle>
                <CardDescription>
                  Premium team statistics and program distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamStats.teamsByProgram}>
                        <XAxis
                          dataKey="program"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="teams"
                          fill="#8884d8"
                          name="Number of Teams"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={teamStats.popularTrainingDays}
                        layout="vertical"
                      >
                        <XAxis type="number" />
                        <YAxis
                          dataKey="day"
                          type="category"
                          width={100}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#82ca9d"
                          name="Training Sessions"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/premium")}
                >
                  View All Premium Teams
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
