// // API utilities for connecting to the backend

// // Update this API_URL to match where your backend is running
// export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// // Get the JWT token from localStorage
// export const getAuthToken = (): string | null => {
//   return localStorage.getItem("token");
// };

// // User API Operations
// export const getUserProfile = async (): Promise<any | null> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return null;
//   }

//   try {
//     const response = await fetch(`${API_URL}/users/profile`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return null;
//   } catch (err) {
//     console.error("Error fetching user profile:", err);
//     return null;
//   }
// };

// export const getAllUsersFromMongoDB = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/users`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error getting all users:", err);
//     return [];
//   }
// };

// // Booking API Operations
// export const saveBookingToMongoDB = async (bookingData: any): Promise<boolean> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return false;
//   }

//   try {
//     const response = await fetch(`${API_URL}/bookings`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(bookingData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Error saving booking:", errorData);
//       return false;
//     }

//     return true;
//   } catch (err) {
//     console.error("Error saving booking:", err);
//     return false;
//   }
// };

// export const getBookingsFromMongoDBByUserId = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/bookings/user`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     return [];
//   }
// };

// export const getAllBookingsFromMongoDB = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/bookings`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error getting all bookings:", err);
//     return [];
//   }
// };

// // Premium Team API Operations
// export const savePremiumTeamToMongoDB = async (teamData: any): Promise<boolean> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return false;
//   }

//   try {
//     const response = await fetch(`${API_URL}/premiumTeams`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(teamData),
//     });

//     return response.ok;
//   } catch (err) {
//     console.error("Error saving premium team:", err);
//     return false;
//   }
// };

// export const getPremiumTeamsFromMongoDBByUserId = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/premiumTeams/user`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error fetching premium teams:", err);
//     return [];
//   }
// };

// export const getAllPremiumTeamsFromMongoDB = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/premiumTeams`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error getting all premium teams:", err);
//     return [];
//   }
// };

// // Coach API Operations
// export const getAllCoachesFromMongoDB = async (): Promise<any[]> => {
//   const token = getAuthToken();
//   if (!token) {
//     console.error("No auth token found");
//     return [];
//   }

//   try {
//     const response = await fetch(`${API_URL}/coaches`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.ok) {
//       return await response.json();
//     }

//     return [];
//   } catch (err) {
//     console.error("Error getting all coaches:", err);
//     return [];
//   }
// };
