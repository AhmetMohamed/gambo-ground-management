import axios from 'axios';

// API base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get the JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Export the api instance
export default api;

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User API
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Fallback to local storage if API fails
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (parseError) {
        console.error('Error parsing user data from localStorage:', parseError);
      }
    }
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Booking API
export const saveBooking = async (bookingData) => {
  try {
    // Ensure all required fields are present
    const requiredFields = ['groundId', 'groundName', 'date', 'startTime', 'endTime', 'price'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // If groundId is missing but we have a ground name, create a synthetic ID
    if (!bookingData.groundId && bookingData.groundName) {
      bookingData.groundId = `ground-${bookingData.groundName.toLowerCase().replace(/\s+/g, '-')}`;
    }

    console.log('Saving booking with data:', bookingData); // Debug log

    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await api.get('/bookings/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

export const getAllBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
};

// Premium Team API
export const savePremiumTeam = async (teamData) => {
  try {
    const response = await api.post('/premiumTeams', teamData);
    return response.data;
  } catch (error) {
    console.error('Error saving premium team:', error);
    throw error;
  }
};

export const getUserPremiumTeams = async () => {
  try {
    const response = await api.get('/premiumTeams/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching premium teams:', error);
    return [];
  }
};

export const getAllPremiumTeams = async () => {
  try {
    const response = await api.get('/premiumTeams');
    return response.data;
  } catch (error) {
    console.error('Error getting all premium teams:', error);
    return [];
  }
};

// Coach API
export const getAllCoaches = async () => {
  try {
    const response = await api.get('/coaches');
    return response.data;
  } catch (error) {
    console.error('Error getting all coaches:', error);
    return [];
  }
};

// Analytics API
export const getUserStatistics = async () => {
  try {
    const response = await api.get('/analytics/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userGrowth: []
    };
  }
};

export const getRevenueAnalytics = async () => {
  try {
    const response = await api.get('/analytics/revenue');
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      revenueByGround: []
    };
  }
};

export const getTeamAnalytics = async () => {
  try {
    const response = await api.get('/analytics/teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    return {
      totalTeams: 0,
      totalPlayers: 0,
      teamsByProgram: [],
      popularTrainingDays: []
    };
  }
};