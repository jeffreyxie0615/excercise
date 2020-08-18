const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const exerciseSchema=new Schema(
    {date : {type: String, required: true}, exercise: [String], 
    meal: [String]}, {timestamps : true}
);
const Exercise=mongoose.model('exercise', exerciseSchema);
module.exports=Exercise;