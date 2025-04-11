import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"; // Define the base URL for the socket connection
// Create a zustand store for authentication state management
export const useAuthStore = create((set,get) => ({
    authUser: null, // Initially set to null, indicating no user is authenticated.
    isSigningUp: false, // Initially set to false, indicating the user is not in the signup process.
    isLoggingIn: false, // Initial state for the login process (false means not logging in)
    isUpdatingProfile: false, // Initial state for the profile update process (false means not updating profile)
    isCheckingAuth: true,  // when the user is getting authenticated there will be a loading  on the screen indicating that the user is getting authenticated
    socket: null, // Initially set to null, indicating no socket connection is established.
    onlineUsers:[],

    checkAuth: async () => { // Function to check if the user is authenticated
        try {
            //auth.route.js in the backend is there for the authentication which has endpoint like api/auth/check and it is a get method

            console.log("Checking authentication...");
            const res = await axiosInstance.get('/auth/check'); // full url is http://localhost:5173/api/auth/check and it is ingrained in the axiosInstance so we dont need to write the full url

            console.log("Authentication successful:", res.data);
            set({authUser: res.data});
            get().connectSocket();
            console.log("After setting state - authUser: ",res.data);
            // in the case u want to see if the user is not logged in and is beg navigated back to login page , replace the res.data to null temporaily
            // If the request is successful, update the authUser state with the response data

        } catch (error) {
            console.error("Error in checkAuth : ",error);
            set({authUser: null});

        }
        finally{
            console.log("Finished checking authentication");
            set({isCheckingAuth: false});
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
          get().connectSocket(); // Call connectSocket after successful signup
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isSigningUp: false });
        }
      },
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          console.log("User logged out Succesfully")
          set({ authUser: null });
          toast.success("Logged out successfully");
          get().disconnectSocket(); // Call disconnectSocket after logout
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },
      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");

          get().connectSocket(); // Call connectSocket after successful login
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },
      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        console.log("In useAuth");
        try {
          const res = await axiosInstance.put("/auth/update-profilepic", data);
          // console.log("Reached useAuth");
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error in updateProfile:", error); // Log the entire error object
        if (error.response && error.response.data) {
            toast.error(error.response.data.message);
        } else {
          console.error("Error details:", error.message); // Log the error message
            toast.error("An unexpected error occurred");
        }
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
      connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
}));

