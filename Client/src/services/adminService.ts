import { User } from "@/types/auth";

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Types for admin dashboard
export interface AdminBooking {
  id: string;
  _id?: string; // Add optional _id for MongoDB compatibility
  userId: string;
  userName: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
}

export interface PremiumTeam {
  id: string;
  _id?: string; // Add optional _id for MongoDB compatibility
  coach: string;
  package: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  players: { name: string; age: string }[];
  userId?: string; // Add userId to track which user created this team
}

export interface Coach {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  specialization: string;
  experience: string;
  availability: string[];
  bio?: string;
  image?: string;
  rating?: number;
}

// Service functions - Now using only backend API calls
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchBookings = async (): Promise<AdminBooking[]> => {
  try {
    // Get current user for authentication
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser) {
      return [];
    }

    // Get token for authenticated requests
    const token = localStorage.getItem("token");
    if (!token) {
      return [];
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // For admin users, show all bookings, for regular users show only their bookings
    const endpoint =
      currentUser?.role === "admin"
        ? `${API_URL}/bookings`
        : `${API_URL}/bookings/user/${currentUser.id}`;

    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchPremiumTeams = async (): Promise<PremiumTeam[]> => {
  try {
    // Get current user for authentication
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser) {
      return [];
    }

    // Get token for authenticated requests
    const token = localStorage.getItem("token");
    if (!token) {
      return [];
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // For admin users, show all teams, for regular users show only their teams
    const endpoint =
      currentUser?.role === "admin"
        ? `${API_URL}/premiumTeams`
        : `${API_URL}/premiumTeams/user/${currentUser.id}`;

    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error("Failed to fetch premium teams");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching premium teams:", error);
    return [];
  }
};

export const fetchCoaches = async (): Promise<Coach[]> => {
  try {
    const response = await fetch(`${API_URL}/coaches`);
    if (!response.ok) {
      throw new Error("Failed to fetch coaches");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return [];
  }
};

export const createCoach = async (
  coachData: Omit<Coach, "id">
): Promise<Coach> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/coaches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(coachData),
    });

    if (!response.ok) {
      throw new Error("Failed to create coach");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating coach:", error);
    throw new Error("Failed to create coach");
  }
};

// Update an existing coach
export const updateCoach = async (coach: Coach): Promise<Coach> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/coaches/${coach.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(coach),
    });

    if (!response.ok) {
      throw new Error("Failed to update coach");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating coach:", error);
    throw new Error("Failed to update coach");
  }
};

// Delete a coach
export const deleteCoach = async (coachId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/coaches/${coachId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete coach");
    }

    return true;
  } catch (error) {
    console.error("Error deleting coach:", error);
    throw new Error("Failed to delete coach");
  }
};

export const createPremiumProgram = async (programData: {
  package: string;
  coach: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  userId: string; // Add userId to the type definition
}): Promise<PremiumTeam> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Get the current user's ID if not provided
    if (!programData.userId) {
      const userData = localStorage.getItem("user");
      const currentUser = userData ? JSON.parse(userData) : null;
      
      if (!currentUser || !currentUser.id) {
        throw new Error("User ID is required but not available");
      }
      
      programData.userId = currentUser.id;
    }

    console.log("Creating premium program with data:", programData); // Debug log

    const response = await fetch(`${API_URL}/premiumTeams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(programData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create premium program");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
};

export const updateUserStatus = async (
  userId: string,
  active: boolean
): Promise<boolean> => {
  try {
    console.log("Updating user status with ID:", userId, "Active:", active);
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Update user status directly without fetching first
    const updateResponse = await fetch(`${API_URL}/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update user status");
    }

    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

// Function to handle exporting overall data as CSV
// Function to export overall data to CSV (users, bookings, premium teams)
export const exportOverallToCSV = (users: any[], bookings: any[], premiumTeams: any[]) => {
  // Create CSV content with sections
  let csvContent = "GAMBO STADIUM - OVERALL REPORT\n";
  csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

  // USER STATISTICS SECTION
  csvContent += "===== USER STATISTICS =====\n";
  csvContent += `Total Users: ${users.length}\n`;
  const activeUsers = users.filter(user => user.status === "active").length;
  csvContent += `Active Users: ${activeUsers}\n`;
  const inactiveUsers = users.filter(user => user.status === "inactive").length;
  csvContent += `Inactive Users: ${inactiveUsers}\n\n`;

  // USER DETAILS SECTION
  csvContent += "===== USER DETAILS =====\n";
  csvContent += "ID,Name,Email,Role,Status,Created Date\n";
  users.forEach(user => {
    const row = [
      user.id,
      user.name,
      user.email,
      user.role,
      user.status,
      user.createdAt
    ];

    // Escape any fields with commas
    const escapedRow = row.map(field => {
      const str = String(field);
      return str.includes(",") ? `"${str}"` : str;
    });

    csvContent += escapedRow.join(",") + "\n";
  });
  csvContent += "\n";

  // BOOKING STATISTICS SECTION
  csvContent += "===== BOOKING STATISTICS =====\n";
  csvContent += `Total Bookings: ${bookings.length}\n`;
  const confirmedBookings = bookings.filter(booking => booking.status === "confirmed").length;
  csvContent += `Confirmed Bookings: ${confirmedBookings}\n`;
  const cancelledBookings = bookings.filter(booking => booking.status === "cancelled").length;
  csvContent += `Cancelled Bookings: ${cancelledBookings}\n`;
  
  // Calculate total revenue
  const totalRevenue = bookings
    .filter(booking => booking.status === "confirmed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0);
  csvContent += `Total Revenue: $${totalRevenue.toFixed(2)}\n\n`;

  // BOOKING DETAILS SECTION
  csvContent += "===== BOOKING DETAILS =====\n";
  csvContent += "ID,User,Ground,Date,Time,Price,Status\n";
  bookings.forEach(booking => {
    const row = [
      booking.id || booking._id || "N/A", // Use id or _id property
      booking.contactEmail || "N/A",
      booking.groundName,
      booking.date,
      `${booking.startTime} - ${booking.endTime}`,
      `$${booking.price}`,
      booking.status
    ];

    // Escape any fields with commas
    const escapedRow = row.map(field => {
      const str = String(field);
      return str.includes(",") ? `"${str}"` : str;
    });

    csvContent += escapedRow.join(",") + "\n";
  });
  csvContent += "\n";

  // PREMIUM PROGRAM STATISTICS SECTION
  csvContent += "===== PREMIUM PROGRAM STATISTICS =====\n";
  csvContent += `Total Premium Teams: ${premiumTeams.length}\n`;
  
  // Calculate total players
  const totalPlayers = premiumTeams.reduce((sum, team) => sum + (team.players?.length || 0), 0);
  csvContent += `Total Players: ${totalPlayers}\n\n`;

  // PREMIUM PROGRAM DETAILS SECTION
  csvContent += "===== PREMIUM PROGRAM DETAILS =====\n";
  csvContent += "ID,Coach,Package,Start Date,End Date,Training Days,Players\n";
  premiumTeams.forEach(team => {
    const row = [
      team.id || team._id || "N/A", // Use id or _id property
      team.coach,
      team.package,
      team.startDate,
      team.endDate,
      team.trainingDays?.join(" | ") || "N/A",
      team.players?.map(p => `${p.name} (${p.age})`).join(" | ") || "N/A"
    ];

    // Escape any fields with commas
    const escapedRow = row.map(field => {
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
    `gambo-stadium-overall-report-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



// Function to export overall data to PDF
export const exportOverallToPDF = async (users: any[] = [], bookings: any[] = [], premiumTeams: any[] = []) => {
  try {
    // Check if jspdf is available
    if (typeof window === 'undefined' || !window.jspdf) {
      console.error('jspdf library not available');
      throw new Error('PDF generation library not available');
    }
    
    // Create a new jsPDF instance
    const doc = new window.jspdf.jsPDF();
    
    // Set font size and add title
    doc.setFontSize(18);
    let title = 'GAMBO STADIUM - OVERALL REPORT';
    
    // Determine the report type based on which arrays have data
    if (users.length > 0 && bookings.length === 0 && premiumTeams.length === 0) {
      title = 'GAMBO STADIUM - USERS REPORT';
    } else if (users.length === 0 && bookings.length > 0 && premiumTeams.length === 0) {
      title = 'GAMBO STADIUM - BOOKINGS REPORT';
    } else if (users.length === 0 && bookings.length === 0 && premiumTeams.length > 0) {
      title = 'GAMBO STADIUM - PREMIUM TEAMS REPORT';
    }
    
    doc.text(title, 105, 15, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Set font size for section headers
    doc.setFontSize(14);
    
    let yPosition = 35;
    
    // USER STATISTICS SECTION - Only if users data is provided
    if (users.length > 0) {
      doc.setFontSize(14);
      doc.text('USER STATISTICS', 14, yPosition);
      doc.setFontSize(10);
      yPosition += 7;
      doc.text(`Total Users: ${users.length}`, 14, yPosition);
      yPosition += 6;
      const activeUsers = users.filter(user => user.active).length;
      doc.text(`Active Users: ${activeUsers}`, 14, yPosition);
      yPosition += 6;
      const inactiveUsers = users.filter(user => !user.active).length;
      doc.text(`Inactive Users: ${inactiveUsers}`, 14, yPosition);
      yPosition += 11; // Add some space before next section
    }
    
    // BOOKING STATISTICS SECTION - Only if bookings data is provided
    if (bookings.length > 0) {
      doc.setFontSize(14);
      doc.text('BOOKING STATISTICS', 14, yPosition);
      doc.setFontSize(10);
      yPosition += 7;
      doc.text(`Total Bookings: ${bookings.length}`, 14, yPosition);
      yPosition += 6;
      const confirmedBookings = bookings.filter(booking => booking.status === "confirmed").length;
      doc.text(`Confirmed Bookings: ${confirmedBookings}`, 14, yPosition);
      yPosition += 6;
      const cancelledBookings = bookings.filter(booking => booking.status === "cancelled").length;
      doc.text(`Cancelled Bookings: ${cancelledBookings}`, 14, yPosition);
      yPosition += 6;
      
      // Calculate total revenue
      const totalRevenue = bookings
        .filter(booking => booking.status === "confirmed")
        .reduce((sum, booking) => sum + (booking.price || 0), 0);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, yPosition);
      yPosition += 11; // Add some space before next section
    }
    
    // PREMIUM PROGRAM STATISTICS SECTION - Only if premium teams data is provided
    if (premiumTeams.length > 0) {
      doc.setFontSize(14);
      doc.text('PREMIUM PROGRAM STATISTICS', 14, yPosition);
      doc.setFontSize(10);
      yPosition += 7;
      doc.text(`Total Premium Teams: ${premiumTeams.length}`, 14, yPosition);
      yPosition += 6;
      
      // Calculate total players
      const totalPlayers = premiumTeams.reduce((sum, team) => sum + (team.players?.length || 0), 0);
      doc.text(`Total Players: ${totalPlayers}`, 14, yPosition);
      yPosition += 6;
    }
    
    // Only add a new page for detailed data if we have any data to display
    if (users.length > 0 || bookings.length > 0 || premiumTeams.length > 0) {
      doc.addPage();
      let userY = 15;
      
      // USER DETAILS SECTION - Only if users data is provided
      if (users.length > 0) {
        doc.setFontSize(14);
        doc.text('USER DETAILS', 14, userY);
        doc.setFontSize(8);
        
        // Create user table headers
        const userHeaders = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created Date'];
        userY = 25;
        
        // Draw user table headers
        doc.setFont('helvetica', 'bold');
        userHeaders.forEach((header, index) => {
          const xPos = 14 + (index * 30);
          doc.text(header, xPos, userY);
        });
        
        // Draw user data
        doc.setFont('helvetica', 'normal');
        userY += 6;
        
        // Only show first 20 users to avoid overflow
        const displayUsers = users.slice(0, 20);
        displayUsers.forEach(user => {
          const userData = [
            String(user.id).substring(0, 8),
            String(user.name).substring(0, 15),
            String(user.email).substring(0, 15),
            String(user.role).substring(0, 10),
            user.active ? "Active" : "Inactive",
            String(user.createdAt).substring(0, 10)
          ];
          
          userData.forEach((value, index) => {
            const xPos = 14 + (index * 30);
            doc.text(value, xPos, userY);
          });
          
          userY += 6;
          
          // Check if we need a new page
          if (userY > 280) {
            doc.addPage();
            userY = 15;
          }
        });
        
        // If we displayed all users, indicate that
        if (users.length > 20) {
          doc.text(`... and ${users.length - 20} more users`, 14, userY);
          userY += 10;
        }
        
        // Add space before next section
        userY += 15;
      }
      
      // BOOKING DETAILS SECTION - Only if bookings data is provided
      if (bookings.length > 0) {
        // Check if we need a new page for bookings
        if (userY > 240 && users.length > 0) {
          doc.addPage();
          userY = 15;
        }
        
        doc.setFontSize(14);
        doc.text('BOOKING DETAILS', 14, userY);
        doc.setFontSize(8);
        
        // Create booking table headers
        const bookingHeaders = ['ID', 'User', 'Ground', 'Date', 'Time', 'Price', 'Status'];
        userY += 10;
        
        // Draw booking table headers
        doc.setFont('helvetica', 'bold');
        bookingHeaders.forEach((header, index) => {
          const xPos = 14 + (index * 25);
          doc.text(header, xPos, userY);
        });
        
        // Draw booking data
        doc.setFont('helvetica', 'normal');
        userY += 6;
        
        // Only show first 20 bookings to avoid overflow
        const displayBookings = bookings.slice(0, 20);
        displayBookings.forEach(booking => {
          const bookingData = [
            String(booking.id || booking._id || 'N/A').substring(0, 8), // Use id or _id property
            String(booking.contactEmail || booking.userName || 'N/A').substring(0, 12),
            String(booking.groundName).substring(0, 12),
            String(booking.date).substring(0, 10),
            `${booking.startTime}-${booking.endTime}`.substring(0, 10),
            `$${booking.price}`,
            String(booking.status).substring(0, 10)
          ];
          
          bookingData.forEach((value, index) => {
            const xPos = 14 + (index * 25);
            doc.text(value, xPos, userY);
          });
          
          userY += 6;
          
          // Check if we need a new page
          if (userY > 280) {
            doc.addPage();
            userY = 15;
          }
        });
        
        // If we displayed all bookings, indicate that
        if (bookings.length > 20) {
          doc.text(`... and ${bookings.length - 20} more bookings`, 14, userY);
          userY += 10;
        }
        
        // Add space before next section
        userY += 15;
      }
      
      // PREMIUM TEAMS DETAILS SECTION - Only if premium teams data is provided
      if (premiumTeams.length > 0) {
        // Check if we need a new page for premium teams
        if (userY > 240) {
          doc.addPage();
          userY = 15;
        }
        
        doc.setFontSize(14);
        doc.text('PREMIUM TEAMS DETAILS', 14, userY);
        doc.setFontSize(8);
        
        // Create premium teams table headers
        const teamHeaders = ['ID', 'Coach', 'Package', 'Start Date', 'End Date', 'Players'];
        userY += 10;
        
        // Draw team table headers
        doc.setFont('helvetica', 'bold');
        teamHeaders.forEach((header, index) => {
          const xPos = 14 + (index * 30);
          doc.text(header, xPos, userY);
        });
        
        // Draw team data
        doc.setFont('helvetica', 'normal');
        userY += 6;
        
        // Only show first 20 teams to avoid overflow
        const displayTeams = premiumTeams.slice(0, 20);
        displayTeams.forEach(team => {
          const teamData = [
            String(team.id || team._id || 'N/A').substring(0, 8), // Use id or _id property
            String(team.coach).substring(0, 15),
            String(team.package).substring(0, 15),
            String(team.startDate).substring(0, 10),
            String(team.endDate).substring(0, 10),
            String(team.players?.length || 0) + ' players'
          ];
          
          teamData.forEach((value, index) => {
            const xPos = 14 + (index * 30);
            doc.text(value, xPos, userY);
          });
          
          userY += 6;
          
          // Check if we need a new page
          if (userY > 280) {
            doc.addPage();
            userY = 15;
          }
        });
        
        // If we displayed all teams, indicate that
        if (premiumTeams.length > 20) {
          doc.text(`... and ${premiumTeams.length - 20} more teams`, 14, userY);
        }
      }
    }
    
    // Save the PDF
    doc.save(`gambo-stadium-overall-report-${new Date().toISOString().split("T")[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
// Function to export users to CSV
export const exportUsersToCSV = (users: User[]): void => {
  // Create CSV content
  const headers = ["ID", "Name", "Email", "Role", "Status", "Member Since"];
  let csvContent = headers.join(",") + "\n";

  users.forEach((user) => {
    const memberSince = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A";

    const row = [
      user.id,
      user.name,
      user.email,
      user.role,
      user.active ? "Active" : "Inactive",
      memberSince,
    ];

    // Escape any fields with commas by wrapping in quotes
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
    `users-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to handle exporting booking data as CSV
export const exportBookingsToCSV = (bookings: AdminBooking[]): void => {
  // Create CSV content
  const headers = [
    "ID",
    "User",
    "Ground",
    "Date",
    "Start Time",
    "End Time",
    "Price",
    "Status",
  ];
  let csvContent = headers.join(",") + "\n";

  bookings.forEach((booking) => {
    const row = [
      booking.id || booking._id || 'N/A', // Use id or _id property
      booking.userName,
      booking.groundName,
      booking.date,
      booking.startTime,
      booking.endTime,
      booking.price,
      booking.status,
    ];

    // Escape any fields with commas by wrapping in quotes
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
    `bookings-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
