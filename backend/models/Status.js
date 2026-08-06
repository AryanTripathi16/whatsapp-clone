import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

text:{
type:String,
default:""
},

image:{
type:String,
default:""
},

createdAt:{
type:Date,
default:Date.now,
expires:86400
},


seenUsers:[
{
user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

seenAt:{
type:Date,
default:Date.now
}

}
]


});


export default mongoose.model(
"Status",
statusSchema
);