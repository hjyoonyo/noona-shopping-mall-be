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

cartController.getCart = async (req,res)=>{
    try {
        const {userId} = req;
        const cart = await Cart.findOne({userId}).populate({
            path:'items',
            populate:{
                path:'productId',
                model: "Product",
            }
        });
        // console.log("rrr ", cart.items);
        res.status(200).json({status:"success",data:cart.items});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

cartController.deleteCartItem = async (req,res) => {
    try {
        const { userId } = req;
        const { id } = req.params; // 요청 파라미터에서 productId 가져오기
        // 특정 productId를 가진 아이템을 삭제
        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter((item) => !item._id.equals(id));
        await cart.save();
        res.status(200).json({status:"success",cartItemQty: cart.items.length });
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

cartController.updateQty = async (req,res)=>{
    try {
        const { userId } = req;
        const { id } = req.params;
        const { qty } = req.body;
        console.log("id",id);
        console.log("qty",qty);
        const cart = await Cart.findOne({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
            },
        });
        if (!cart) throw new Error("카트가 존재하지 않습니다.");
        const index = cart.items.findIndex((item) => item._id.equals(id));
        if (index === -1) throw new Error("해당 아이템이 존재하지 않습니다.");
        cart.items[index].qty = qty;
        await cart.save();
        res.status(200).json({ status: 200, data: cart.items });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
}

cartController.getCartQty = async (req,res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId });
        
        res.status(200).json({status:"success",cartItemQty: cart.items.length });
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports = cartController;