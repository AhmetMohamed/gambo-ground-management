import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ChevronDown, ChevronUp, Download, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { fetchUsers, updateUserStatus, exportUsersToCSV } from "@/services/adminService";
import { User } from "@/types/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
  });

  const queryClient = useQueryClient();

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      updateUserStatus(userId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  // Handle status toggle
  const handleStatusToggle = (userId: string, isActive: boolean) => {
    console.log("Toggling status for user:", userId, "Current active state:", isActive);
    updateUserStatusMutation.mutate({ userId, active: !isActive });
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle export users data
  const handleExportData = () => {
    if (users.length === 0) {
      toast.error("No user data available to export");
      return;
    }

    exportUsersToCSV(users);
    toast.success("User data exported successfully");
  };

  // Handle adding a new user
  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here you would typically call an API to create the user
    // For now, we'll just show a success message
    toast.success(`User ${newUser.name} would be created here`);
    setIsAddUserDialogOpen(false);
    setNewUser({ name: "", email: "", role: "user" });
  };

  // Filter and sort users
  const filteredUsers = users.filter(
    (user) =>
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valueA = a[sortField as keyof User]?.toString().toLowerCase() || "";
    const valueB = b[sortField as keyof User]?.toString().toLowerCase() || "";

    return sortDirection === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  return (
    <AdminLayout>
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading users data...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted p-3 rounded-t-md font-medium text-sm">
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortField === "email" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                  <div>Member Since</div>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    Role
                    {sortField === "role" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                  <div className="text-center">Status</div>
                </div>

                <div>
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className={`grid grid-cols-5 p-3 items-center ${
                          index < sortedUsers.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div>{user.name}</div>
                        <div className="text-sm">{user.email}</div>
                        <div>
                          {user.createdAt
                            ? format(new Date(user.createdAt), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                        <div>
                          <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.active}
                              onCheckedChange={() => {
                                handleStatusToggle(user.id, user.active);
                            }}
                            id={`user-active-${user.id}`}
                          />
                          <Label htmlFor={`user-active-${user.id}`}>
                              {user.active ? (
                                <span className="text-green-600 text-sm">
                                  Active
                                </span>
                              ) : (
                                <span className="text-red-600 text-sm">
                                  Inactive
                                </span>
                              )}
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm
                        ? `No users found matching "${searchTerm}"`
                        : "No users available"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export Users
            </Button>
            <Button 
              className="bg-gambo hover:bg-gambo-dark"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </CardFooter>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. The user will receive an email to set their password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}