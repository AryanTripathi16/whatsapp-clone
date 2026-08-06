import express from "express";
import Status from "../models/Status.js";

const router = express.Router();


// CREATE STATUS
router.post("/", async(req,res)=>{

try{

const status = await Status.create({

user:req.body.user,

text:req.body.text,

image:req.body.image || ""

});

res.json(status);


}
catch(err){

res.status(500).json({
message:err.message
});

}

});



// GET ALL STATUS

router.get("/", async(req,res)=>{

try{

const status = await Status.find()
.populate("user","name avatar")
.populate("seenUsers.user","name avatar")
.sort({
createdAt:-1
});


res.json(status);


}
catch(err){

res.status(500).json({
message:err.message
});

}

});


// STATUS SEEN

router.post("/seen", async(req,res)=>{

try{

const {statusId,userId} = req.body;

const status = await Status.findById(statusId);

console.log("STATUS ID:", statusId);
console.log("USER ID:", userId);

if(!status){
return res.status(404).json({
message:"Status not found"
});
}


// check already seen

const alreadySeen = status.seenUsers.find(
(item)=>item.user.toString() === userId.toString()
);


if(!alreadySeen){

status.seenUsers.push({

user:userId,

seenAt:new Date()

});

await status.save();


console.log("SEEN SAVED:", status.seenUsers);

}


res.json({
message:"Seen saved"
});


}
catch(err){

res.status(500).json({
message:err.message
});

}

});


// GET STATUS SEEN USERS

router.get("/seen/:statusId", async (req, res) => {
  try {

    const status = await Status.findById(req.params.statusId)
      .populate("seenUsers.user", "name avatar");

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    const result = status.seenUsers.map((item) => ({
      _id: item.user?._id,
      name: item.user?.name,
      avatar: item.user?.avatar,
      seenAt: item.seenAt,
    }));

    res.json(result);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// STATUS VIEW COUNT

router.get("/views/:statusId", async(req,res)=>{

try{

const status = await Status.findById(
req.params.statusId
);


if(!status){

return res.status(404).json({
message:"Status not found"
});

}


res.json({
views: status.seenUsers.length
});


}
catch(err){

res.status(500).json({
message:err.message
});

}

});


// DELETE STATUS

router.delete("/:id", async(req,res)=>{

try{

const status = await Status.findById(req.params.id);


if(!status){

return res.status(404).json({
message:"Status not found"
});

}


await status.deleteOne();


res.json({
message:"Status deleted"
});


}
catch(err){

res.status(500).json({
message:err.message
});

}

});


export default router;