import express from "express"
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);

// for updating profile pic after the user has logged in i.e. thru protectRoute

router.put("/update-profilepic",protectRoute,updateProfile)

router.get("/check",protectRoute,checkAuth);
// Compare this snippet from backend/src/controllers/user.controller.js:
export default router;