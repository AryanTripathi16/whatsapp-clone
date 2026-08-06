import express from "express";
import { getUsers, updateAvatar } from "../controllers/userController.js";
import upload from "../middleware/upload.js";

import User from "../models/User.js";

const router = express.Router();

// ================= GET ALL USERS =================
router.get("/", getUsers);

// ================= UPDATE USER AVATAR =================
router.put(
  "/avatar",
  upload.single("avatar"),
  updateAvatar
);



// ================= PROFILE UPDATE ================

router.put("/:id", async(req,res)=>{

try{

const user = await User.findByIdAndUpdate(

req.params.id,

{
about:req.body.about,
phone:req.body.phone
},

{
new:true
}

);


res.json(user);


}
catch(err){

res.status(500).json({
message:err.message
});

}

});

export default router;