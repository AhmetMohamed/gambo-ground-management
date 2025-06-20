import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileForm from "./ProfileForm";
import { toast } from "@/components/ui/sonner";
import { User } from "@/types/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  passwordOnly?: boolean;
}

const EditProfileDialog = ({
  open,
  onOpenChange,
  user,
  passwordOnly = false,
}: EditProfileDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    // Get current user data
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && user && token) {
      try {
        // Parse the user data
        const parsedUser = JSON.parse(userData);

        // Update the user data
        const updatedUser = {
          ...parsedUser,
          name: values.name,
          email: values.email,
          phone: values.phone || parsedUser.phone,
          location: values.location || parsedUser.location,
        };

        // Prepare the data to send to the API
        const dataToUpdate = {
          name: values.name,
          email: values.email,
          phone: values.phone || parsedUser.phone,
          location: values.location || parsedUser.location,
        };

        // Add password to update data if provided
        if (values.password) {
          (dataToUpdate as { password?: string }).password = values.password;
        }

        // Make API call to update profile on server - Use the correct API URL
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(dataToUpdate),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile on server");
        }

        // Save the updated user data to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Show success message
        toast.success("Profile updated successfully");

        // Close the dialog
        onOpenChange(false);

        // Refresh the page to show updated profile
        window.location.reload();
      } catch (e) {
        console.error("Error updating profile", e);
        toast.error("Failed to update profile");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("No user data found");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {passwordOnly ? "Update Password" : "Edit Profile"}
          </DialogTitle>
        </DialogHeader>
        <ProfileForm
          initialData={{
            name: user?.name || "",
            email: user?.email || "",
            phone: (user as any)?.phone || "",
            location: (user as any)?.location || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          disableNameEmail={passwordOnly}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
