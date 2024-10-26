const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

//회원가입
router.post("/",userController.createUser);
router.get("/me",authController.authenticate,userController.getUser); // 1. 토큰 유효성 검증, 2. token으로 유저 찾아서 리턴 

module.exports = router;


// 미들웨어, 체인 구조
// why? 함수는 1개의 역할만 한다. 역할 분리에 좋음. authenticaate는 다른 곳에서도 쓰일 수 있음.
