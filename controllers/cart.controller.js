const cartController = {};
const Cart = require("../models/Cart");

cartController.addItemToCart= async(req,res)=>{
    try {
        const {userId} = req; //미들웨어에서 가져옴
        const {productId, size, qty} = req.body; //프론트엔드에서 가져옴
        
        //유저를 가지고 카트 찾기
        let cart = await Cart.findOne({userId});
        //유저가 만든 카트가 없으면 만들기
        if(!cart){
            cart = new Cart({userId});
            await cart.save();
        }
        
        //이미 카트에 들어가 있는 아이템이냐? 에러 : 추가 //productId, size 비교
        const existItem = cart.items.find(
            (item)=>item.productId.equals(productId) && item.size===size //몽구스 오브젝트 아이디는 equals로 비교 가능
        );

        if(existItem){
            throw new Error("아이템이 이미 카트에 담겨 있습니다.");
        }

        //카트에 아이템 추가
        cart.items = [...cart.items,{productId,size,qty}];
        await cart.save();

        res.status(200).json({status:"success",data:cart,cartItemQty:cart.items.length});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
};

cartController.getCartList = async (req,res)=>{
    try {
        const {userId} = req;
        const cart = await Cart.findOne({userId});
        // console.log("rrr ", cart);
        res.status(200).json({status:"success",data:cart});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports = cartController;