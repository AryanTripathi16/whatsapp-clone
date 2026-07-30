import User from "../models/User.js";


export const updateAvatar = async (req,res)=>{

  try{


    const { userId } = req.body;


    if(!req.file){

      return res.status(400).json({
        message:"Please upload image"
      });

    }



    const user = await User.findByIdAndUpdate(

      userId,

      {
        avatar:req.file.filename
      },

      {
        new:true
      }

    );



    res.json({

      message:"Avatar Updated Successfully",

      user

    });



  }catch(error){


    res.status(500).json({

      message:error.message

    });


  }

};