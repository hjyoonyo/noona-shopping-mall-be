const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");

//카트 추가
router.post("/",authController.authenticate, cartController.addItemToCart);

//카트리스트 불러오기
router.get("/",authController.authenticate, cartController.getCartList)

module.exports = router;