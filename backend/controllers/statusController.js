import Status from "../models/Status.js";


// CREATE STATUS

export const createStatus = async(req,res)=>{

try{

const status = await Status.create({

user:req.body.user,
text:req.body.text

});


res.json(status);


}catch(err){

res.status(500).json({
message:err.message
});

}

};



// GET STATUS

export const getStatus = async(req,res)=>{

try{

const status = await Status.find()
.populate("user","name avatar")
.sort({
createdAt:-1
});


res.json(status);


}catch(err){

res.status(500).json({
message:err.message
});

}

};

// markStatusSeen

export const markStatusSeen = async (req, res) => {
  try {
    const { statusId, userId } = req.body;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    const alreadySeen = status.seenUsers.find(
      (item) => item.user.toString() === userId
    );

    if (!alreadySeen) {
      status.seenUsers.push({
        user: userId,
        seenAt: new Date(),
      });

      await status.save();
    }

    res.json({
      success: true,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// getSeenUsers

export const getSeenUsers = async (req, res) => {
  try {
const status = await Status.findById(req.params.statusId)
    
      .populate("seenUsers.user", "name avatar");

    if (!status) {
      return res.status(404).json({
        message: "Status not found",
      });
    }

    const users = status.seenUsers.map((item) => ({
      _id: item.user._id,
      name: item.user.name,
      avatar: item.user.avatar,
      seenAt: item.seenAt,
    }));

    res.json(users);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};