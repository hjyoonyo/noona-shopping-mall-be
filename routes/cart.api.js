const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");

//카트 추가
router.post("/",authController.authenticate, cartController.addItemToCart);

//카트리스트 불러오기
router.get("/",authController.authenticate, cartController.getCart)

//카트 상품 삭제
router.delete("/:id",authController.authenticate, cartController.deleteCartItem)

//카트 상품 수량 수정
router.put("/:id",authController.authenticate, cartController.updateQty);

//카트 수량 가져오기
router.get("/qty",authController.authenticate, cartController.getCartQty)
module.exports = router;