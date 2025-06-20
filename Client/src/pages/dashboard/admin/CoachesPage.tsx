import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, User, Calendar } from "lucide-react";
import {
  fetchCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
  Coach,
} from "@/services/adminService";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CoachesPage() {
  const [showCreateCoachDialog, setShowCreateCoachDialog] = useState(false);
  const [showEditCoachDialog, setShowEditCoachDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  // New coach state
  const [newCoach, setNewCoach] = useState({
    name: "",
    specialization: "",
    experience: "",
    availability: [] as string[],
    bio: "",
    image: "",
    rating: 0,
  });

  const queryClient = useQueryClient();

  // Fetch coaches data
  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: fetchCoaches,
  });

  // Create coach mutation
  const createCoachMutation = useMutation({
    mutationFn: createCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setShowCreateCoachDialog(false);
      resetCoachForm();
      toast({
        title: "Success",
        description: "Coach created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create coach: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Update an existing coach
  const updateCoachMutation = useMutation({
    mutationFn: updateCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setShowEditCoachDialog(false);
      setSelectedCoach(null);
      toast({
        title: "Success",
        description: "Coach updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating coach:", error);
      toast({
        title: "Error",
        description: `Failed to update coach: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Delete a coach
  const deleteCoachMutation = useMutation({
    mutationFn: deleteCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setShowDeleteDialog(false);
      setSelectedCoach(null);
      toast({
        title: "Success",
        description: "Coach deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting coach:", error);
      toast({
        title: "Error",
        description: `Failed to delete coach: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle availability change
  const handleAvailabilityChange = (day: string, isEdit = false) => {
    if (isEdit && selectedCoach) {
      const availability = [...(selectedCoach.availability || [])];
      if (availability.includes(day)) {
        setSelectedCoach({
          ...selectedCoach,
          availability: availability.filter((d) => d !== day),
        });
      } else {
        setSelectedCoach({
          ...selectedCoach,
          availability: [...availability, day],
        });
      }
    } else {
      if (newCoach.availability.includes(day)) {
        setNewCoach({
          ...newCoach,
          availability: newCoach.availability.filter((d) => d !== day),
        });
      } else {
        setNewCoach({
          ...newCoach,
          availability: [...newCoach.availability, day],
        });
      }
    }
  };

  // Reset coach form
  const resetCoachForm = () => {
    setNewCoach({
      name: "",
      specialization: "",
      experience: "",
      availability: [],
      bio: "",
      image: "",
      rating: 0,
    });
  };

  // Handle create coach
  const handleCreateCoach = () => {
    if (!newCoach.name) {
      toast({
        title: "Validation Error",
        description: "Coach name is required",
        variant: "destructive",
      });
      return;
    }

    createCoachMutation.mutate(newCoach);
  };

  // Handle edit coach
  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowEditCoachDialog(true);
  };

  // Handle update coach
  const handleUpdateCoach = () => {
    if (!selectedCoach) return;

    if (!selectedCoach.name) {
      toast({
        title: "Validation Error",
        description: "Coach name is required",
        variant: "destructive",
      });
      return;
    }

    // Make sure we're sending the ID correctly
    const coachToUpdate = {
      ...selectedCoach,
      id: selectedCoach._id || selectedCoach.id, // Handle both MongoDB _id and client-side id
    };

    updateCoachMutation.mutate(coachToUpdate);
  };

  // Handle delete coach
  const handleDeleteCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowDeleteDialog(true);
  };

  // Confirm delete coach
  const confirmDeleteCoach = () => {
    if (selectedCoach) {
      // Use _id if available, otherwise fall back to id
      const coachId = selectedCoach._id || selectedCoach.id;
      deleteCoachMutation.mutate(coachId);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 w-full">
        <h1 className="text-3xl font-bold mb-8">Coaches Management</h1>
        <Card>
          <CardHeader>
            <CardTitle>Coaches</CardTitle>
            <CardDescription>
              View and manage coaches for premium training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading coaches data...</p>
              </div>
            ) : coaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coaches.map((coach) => (
                  <Card key={coach.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{coach.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCoach(coach)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCoach(coach)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{coach.specialization}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {coach.image && (
                        <div className="mb-3">
                          <img
                            src={coach.image}
                            alt={`${coach.name}`}
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/150?text=Coach";
                            }}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gambo" />
                          <span>Experience: {coach.experience}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gambo" />
                          <span>
                            Available on:{" "}
                            {coach.availability && coach.availability.length > 0
                              ? coach.availability.join(", ")
                              : "Not specified"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No coaches available</p>
                <Button
                  className="bg-gambo hover:bg-gambo-dark"
                  onClick={() => setShowCreateCoachDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Coach
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="bg-gambo hover:bg-gambo-dark ml-auto"
              onClick={() => setShowCreateCoachDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Coach
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dialog for Creating a Coach */}
      <Dialog
        open={showCreateCoachDialog}
        onOpenChange={setShowCreateCoachDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coach</DialogTitle>
            <DialogDescription>
              Create a new coach for premium training programs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coach-name">Coach Name</Label>
              <Input
                id="coach-name"
                placeholder="Enter coach name"
                value={newCoach.name}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-specialization">Specialization</Label>
              <Input
                id="coach-specialization"
                placeholder="e.g. Youth Development"
                value={newCoach.specialization}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, specialization: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-experience">Experience (Years)</Label>
              <Input
                id="coach-experience"
                placeholder="e.g. 5 years"
                value={newCoach.experience}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, experience: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-bio">Bio</Label>
              <Textarea
                id="coach-bio"
                placeholder="Enter coach biography"
                value={newCoach.bio}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, bio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-image">Profile Image URL</Label>
              <Input
                id="coach-image"
                placeholder="Enter image URL"
                value={newCoach.image}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, image: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
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
                      id={`day-${day}`}
                      checked={newCoach.availability.includes(day)}
                      onCheckedChange={() => handleAvailabilityChange(day)}
                    />
                    <label
                      htmlFor={`day-${day}`}
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
              onClick={() => {
                setShowCreateCoachDialog(false);
                resetCoachForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCoach}>Create Coach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing a Coach */}
      <Dialog open={showEditCoachDialog} onOpenChange={setShowEditCoachDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coach</DialogTitle>
            <DialogDescription>Update coach information</DialogDescription>
          </DialogHeader>

          {selectedCoach && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-coach-name">Coach Name</Label>
                <Input
                  id="edit-coach-name"
                  placeholder="Enter coach name"
                  value={selectedCoach.name}
                  onChange={(e) =>
                    setSelectedCoach({
                      ...selectedCoach,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-coach-specialization">
                  Specialization
                </Label>
                <Input
                  id="edit-coach-specialization"
                  placeholder="e.g. Youth Development"
                  value={selectedCoach.specialization}
                  onChange={(e) =>
                    setSelectedCoach({
                      ...selectedCoach,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-coach-experience">
                  Experience (Years)
                </Label>
                <Input
                  id="edit-coach-experience"
                  placeholder="e.g. 5 years"
                  value={selectedCoach.experience}
                  onChange={(e) =>
                    setSelectedCoach({
                      ...selectedCoach,
                      experience: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-coach-bio">Bio</Label>
                <Textarea
                  id="edit-coach-bio"
                  placeholder="Enter coach biography"
                  value={selectedCoach.bio || ""}
                  onChange={(e) =>
                    setSelectedCoach({
                      ...selectedCoach,
                      bio: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-coach-image">Profile Image URL</Label>
                <Input
                  id="edit-coach-image"
                  placeholder="Enter image URL"
                  value={selectedCoach.image || ""}
                  onChange={(e) =>
                    setSelectedCoach({
                      ...selectedCoach,
                      image: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
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
                        id={`edit-day-${day}`}
                        checked={
                          selectedCoach.availability?.includes(day) || false
                        }
                        onCheckedChange={() =>
                          handleAvailabilityChange(day, true)
                        }
                      />
                      <label
                        htmlFor={`edit-day-${day}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditCoachDialog(false);
                setSelectedCoach(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCoach}>Update Coach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Deleting a Coach */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coach and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCoach(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCoach}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
