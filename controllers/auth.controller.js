const authController = {};
const User = require("../models/User"); // 기존 유저
const jwt = require("jsonwebtoken"); // 토큰 발행
const bcrypt = require("bcryptjs"); // 암호화

//토큰 발행 키
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//로그인
authController.loginWithEmail = async(req,res)=>{
    try {
        const{email,password} = req.body;
        const user = await User.findOne({email}); // 이메일로 유저 정보 가져오기

        if(!email){
            throw new Error("이메일을 입력하세요.");
        }

        if(!password){
            throw new Error("패스워드를 입력하세요.");
        }

        if(user){
            const isMatch = await bcrypt.compareSync(password, user.password);

            if(isMatch){
                const token = await user.generateToken();
                return res.status(200).json({status:"success", user, token});
            }else{
                throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
            }
        }else{
            throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    } catch (error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

authController.authenticate = async (req,res,next)=>{
    try {
        const tokenString = req.headers.authorization;
        
        if(!tokenString) throw new Error("Token not found");
        
        const token = tokenString.replace("Bearer ","");
        
        jwt.verify(token,JWT_SECRET_KEY,(error,payload)=>{
            if(error){
                throw new Error("invalid token");
            } 
            req.userId = payload._id; 
        });
        next();
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

authController.checkAdminPermission = async(req,res,next)=>{
    try {
        const {userId} = req;
        const user = await User.findById(userId);

        if(user.level !== "admin") throw new Error("no permission");

        next();
    } catch (error) {
        res.status(400).json({status:"fail", error:error.message});
    }

}

module.exports = authController;
