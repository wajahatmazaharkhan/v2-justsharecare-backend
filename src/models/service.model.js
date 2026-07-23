import mongoose from "mongoose";

const ServiseSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    slug : {
        type : String ,
        enum: [
        "mental-health",
        "wellness-therapy",
        "sexual-health",
        "womens-health",
      ],
        required : true
    }

} , { timestamps : true})


export const Service = mongoose.model("Service",ServiseSchema);