import Message from "../models/Message.js";


// Send Message

export const sendMessage = async(req,res)=>{

try{


const message = await Message.create({

sender:req.body.sender,

receiver:req.body.receiver,

text:req.body.text || "",

image:req.body.image || "",

file:req.body.file || "",

fileName:req.body.fileName || "",

seen:false

});


res.status(201).json(message);


}
catch(error){

res.status(500).json({
message:error.message
});

}


};







// Get Messages

export const getMessages = async(req,res)=>{


try{


const {
sender,
receiver
}=req.params;



const messages = await Message.find({

$or:[

{
sender,
receiver
},

{
sender:receiver,
receiver:sender
}

]

})
.sort({
createdAt:1
});



res.json(messages);


}
catch(error){

res.status(500).json({
message:error.message
});

}


};







// Mark Seen

export const markSeen = async(req,res)=>{


try{


const {
sender,
receiver
}=req.body;



await Message.updateMany(

{
sender,
receiver,
seen:false
},

{
$set:{
seen:true
}
}

);



res.json({

success:true

});


}
catch(error){


res.status(500).json({

message:error.message

});


}


};