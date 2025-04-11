import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  const authUser = useAuthStore.getState().authUser;
  const socket = useAuthStore.getState().socket;

  socket.on("newMessage", (newMessage) => {
    // Check if the newMessage belongs to the currently active conversation:
    if (
      selectedUser &&
      (
        (newMessage.senderID === selectedUser._id && newMessage.receiverID === authUser._id) ||
        (newMessage.senderID === authUser._id && newMessage.receiverID === selectedUser._id)
      )
    ) {
      // Only append the message if the conversation is currently open.
      set({ messages: [...get().messages, newMessage] });
    }

    // Update notifications for users not currently being chatted with.
    set((state) => {
      const updatedUsers = state.users.map((user) => {
        // Increase notification if the message involves this user but not the active conversation.
        if (
          (user._id === newMessage.senderID || user._id === newMessage.receiverID) &&
          (!selectedUser || user._id !== selectedUser._id)
        ) {
          return {
            ...user,
            notificationCount: (user.notificationCount || 0) + 1,
            lastMessageAt: newMessage.createdAt,
          };
        }
        return user;
      });
      return { users: updatedUsers };
    });
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) =>
    set((state) => ({
      selectedUser,
      // Clear notification on selected user
      users: state.users.map((user) =>
        user._id === selectedUser._id
          ? { ...user, notificationCount: 0 }
          : user
      ),
    })),
}));