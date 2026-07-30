import express from "express";
import multer from "multer";
import User from "../models/User.js";


const router = express.Router();




// storage

const storage = multer.diskStorage({

destination:(req,file,cb)=>{

cb(
null,
"uploads/"
);

},


filename:(req,file,cb)=>{

cb(

null,

Date.now()+"-"+file.originalname

);

}

});



const upload = multer({

storage

});







// Chat Image Upload

router.post(

"/image",

upload.single("image"),

(req,res)=>{


res.json({

url:`/uploads/${req.file.filename}`

});


}

);








// Chat File Upload

router.post(

"/file",

upload.single("file"),

(req,res)=>{


res.json({

url:`/uploads/${req.file.filename}`,

fileName:req.file.originalname

});


}

);









// Profile Avatar Upload

router.post(

"/avatar",

upload.single("avatar"),

async(req,res)=>{


try{


const user = await User.findByIdAndUpdate(

req.body.userId,

{

avatar:`/uploads/${req.file.filename}`

},

{
new:true
}

);



res.json({

user

});


}catch(error){


res.status(500).json({

message:error.message

});


}


}

);







export default router;