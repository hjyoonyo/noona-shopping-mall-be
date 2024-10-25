const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userController={};

userController.createUser = async(req,res) => {
    try {
        let {email,password,name,level} = req.body;

        const user = await User.findOne({email:email});
        if(user){
            throw new Error("이미 가입된 이메일입니다.");
        }
        //비밀번호 아호화
        const salt = await bcrypt.genSaltSync(10);
        password = await bcrypt.hash(password,salt);

        //새 회원 생성
        const newUser = new User({email,password,name,level:level?level:'customer'});;
        await newUser.save();
        
        return res.status(200).json({status:"success"});
    } catch (error) {
        res.status(400).json({status:"fail", error: error.message});
    }
}


module.exports = userController;