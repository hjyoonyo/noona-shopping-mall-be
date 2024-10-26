const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken"); //토큰 발행 라이브러리
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


const userSchema = Schema({
    email:{type:String, required:true,unique:true},
    password:{type:String,required:true},
    name:{type:String,required:true},
    level:{type:String,default:"customer"} //2types: customer, admin
},{timestamps:true})

//보여 줄 정보 필터링
userSchema.methods.toJSON = function(){
    const obj = this._doc;
    delete obj.password;
    delete obj.__v;
    delete obj.updateAt;
    delete obj.createAt;
    return obj;
}

//token
userSchema.methods.generateToken=function(){
    const token = jwt.sign(
        {_id:this._id}, 
        JWT_SECRET_KEY,
        {expiresIn:'1d'}
    );
    return token;
}

const User = mongoose.model("User",userSchema);
module.exports = User;
