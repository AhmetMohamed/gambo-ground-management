import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, ChevronDown, ChevronUp, Plus, User, Calendar, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { fetchPremiumTeams, fetchCoaches, createPremiumProgram } from "@/services/adminService";
import { toast } from "@/components/ui/use-toast";

export default function AdminPremiumTeamsPage() {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false);
  const [showAllProgramsDialog, setShowAllProgramsDialog] = useState(false);

  // New program state
  const [newProgram, setNewProgram] = useState({
    package: "",
    coach: "",
    startDate: "",
    endDate: "",
    trainingDays: [] as string[],
    userId: "", // Add this field
  });

  const queryClient = useQueryClient();

  // Fetch premium teams data
  const { data: premiumTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["premiumTeams"],
    queryFn: fetchPremiumTeams,
  });

  // Fetch coaches data
  const { data: coaches = [] } = useQuery({
    queryKey: ["coaches"],
    queryFn: fetchCoaches,
  });

  // Get all unique program names
  const allPrograms = Array.from(
    new Set(premiumTeams.map((team) => team.package))
  );

  // Coach creation has been moved to CoachesPage

  // Create program mutation
  const createProgramMutation = useMutation({
    mutationFn: createPremiumProgram,
    // In the onSuccess callback of createProgramMutation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premiumTeams"] });
      setShowCreateProgramDialog(false);
      setNewProgram({
        package: "",
        coach: "",
        startDate: "",
        endDate: "",
        trainingDays: [],
        userId: "", // Reset this field too
      });
      toast({
        title: "Success",
        description: "Program created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create program: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle training days change
  const handleTrainingDaysChange = (day: string) => {
    if (newProgram.trainingDays.includes(day)) {
      setNewProgram({
        ...newProgram,
        trainingDays: newProgram.trainingDays.filter((d) => d !== day),
      });
    } else {
      setNewProgram({
        ...newProgram,
        trainingDays: [...newProgram.trainingDays, day],
      });
    }
  };

  // Handle create program
  const handleCreateProgram = () => {
    if (!newProgram.package || !newProgram.coach) {
      toast({
        title: "Validation Error",
        description: "Program name and coach are required",
        variant: "destructive",
      });
      return;
    }
    
    // Get the current user's ID from localStorage
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;
    
    if (!currentUser || !currentUser.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a premium program",
        variant: "destructive",
      });
      return;
    }
    
    // Include the userId in the request
    const programWithUserId = {
      ...newProgram,
      userId: currentUser.id
    };
    
    createProgramMutation.mutate(programWithUserId);
  };

  return (
    <AdminLayout>
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-8">Premium Teams</h1>
        <Card>
          <CardHeader>
            <CardTitle>Premium Training Teams</CardTitle>
            <CardDescription>
              View and manage premium training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamsLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading premium teams data...</p>
              </div>
            ) : premiumTeams.length > 0 ? (
              <div className="space-y-4">
                {premiumTeams.map((team) => (
                  <div
                    key={team.id}
                    className="border rounded-md overflow-hidden"
                  >
                    <div
                      className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setExpandedTeam(
                          expandedTeam === team.id ? null : team.id
                        )
                      }
                    >
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Award className="h-5 w-5 text-gambo" />
                          {team.package}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Coach: {team.coach}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {team.startDate && team.endDate
                              ? `${format(
                                  new Date(team.startDate),
                                  "MMM d"
                                )} - ${format(
                                  new Date(team.endDate),
                                  "MMM d, yyyy"
                                )}`
                              : "Dates not available"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {team.players
                              ? `${team.players.length} players`
                              : "0 players"}
                          </p>
                        </div>
                        <div>
                          {expandedTeam === team.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedTeam === team.id && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Training Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CalendarRange className="h-4 w-4 text-gambo" />
                                <span>
                                  Training days:{" "}
                                  {team.trainingDays
                                    ? team.trainingDays.join(", ")
                                    : "Not specified"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gambo" />
                                <span>Coach: {team.coach}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gambo" />
                                <span>
                                  Start:{" "}
                                  {team.startDate
                                    ? format(
                                        new Date(team.startDate),
                                        "MMMM d, yyyy"
                                      )
                                    : "Not set"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gambo" />
                                <span>
                                  End:{" "}
                                  {team.endDate
                                    ? format(
                                        new Date(team.endDate),
                                        "MMMM d, yyyy"
                                      )
                                    : "Not set"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Team Players</h4>
                            <div className="space-y-1">
                              {team.players && team.players.length > 0 ? (
                                team.players.map((player, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between border-b py-1 last:border-0"
                                  >
                                    <span>{player.name}</span>
                                    <span className="text-sm text-gray-500">
                                      Age: {player.age}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500">
                                  No players enrolled yet
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Edit Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Contact Team
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No premium teams available
                </p>
                <Button
                  className="bg-gambo hover:bg-gambo-dark"
                  onClick={() => setShowCreateProgramDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Program
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAllProgramsDialog(true)}
            >
              View All Programs
            </Button>
            <Button
              className="bg-gambo hover:bg-gambo-dark"
              onClick={() => setShowCreateProgramDialog(true)}
            >
              Create Program
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Coach creation dialog has been moved to CoachesPage */}

      {/* Dialog for Creating a Premium Program */}
      <Dialog
        open={showCreateProgramDialog}
        onOpenChange={setShowCreateProgramDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>
              Create a new premium training program
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="program-name">Program Name</Label>
              <Input
                id="program-name"
                placeholder="e.g. Elite Training"
                value={newProgram.package}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, package: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program-coach">Select Coach</Label>
              <div className="space-y-2">
                <Select
                  value={newProgram.coach}
                  onValueChange={(value) =>
                    setNewProgram({ ...newProgram, coach: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.length > 0 ? (
                      coaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.name}>
                          {coach.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-coaches" disabled>
                        No coaches available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {coaches.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Please add coaches in the Coaches section before creating a program.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newProgram.startDate}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newProgram.endDate}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Training Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`training-${day}`}
                      checked={newProgram.trainingDays.includes(day)}
                      onCheckedChange={() => handleTrainingDaysChange(day)}
                    />
                    <label
                      htmlFor={`training-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateProgramDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProgram}>Create Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}