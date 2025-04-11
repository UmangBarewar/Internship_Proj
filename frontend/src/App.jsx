import React, { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import { Routes, Route, Navigate} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import {Loader} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useStoreTheme.js';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,onlineUsers } = useAuthStore();
  const {theme}= useThemeStore();

  console.log({onlineUsers});
  useEffect(() => {
    checkAuth();
    console.log("checkAuth called");
  }, [checkAuth]);
  console.log({ authUser,isCheckingAuth });
  
  //just in case u want to see the loading screen when the user is getting authenticated simply put true in the conditional statement

  // Set the theme on the root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (!authUser && isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" /> } />
        {/* <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to={"/"}/>} /> */}
        <Route path='/signup' element={<SignupPage />}/>
        {/* this will ensure the user is navigated to the home page if the user is authenticated */}
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        {/* this will ensure the user is navigated to the login page if the user is not authenticated */}
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;