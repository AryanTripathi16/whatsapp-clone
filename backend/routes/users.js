import express from "express";
import { getUsers, updateAvatar } from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ================= GET ALL USERS =================
router.get("/", getUsers);

// ================= UPDATE USER AVATAR =================
router.put(
  "/avatar",
  upload.single("avatar"),
  updateAvatar
);

export default router;