const Order = require("../models/Order");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController ={};

orderController.createOrder=async(req,res)=>{
    try {
        //1.프론트엔드에서 데이터 받아오기 userId,totalPrice,shipTo,contact,orderList
        const {userId} = req;
        const {shipTo,contact,totalPrice,orderList} =req.body;

        //1.5재고확인 & 재고 업데이트
        const insufficientStockItems = await productController.checkItemListStock(orderList);

        //재고가 충분치 않은 아이템 존재 => 에러
        if(insufficientStockItems.length > 0){
            const errorMessage = insufficientStockItems.reduce((total,item)=>(total+=item.message),"");
            throw new Error(errorMessage)
        }

        //2.order만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items:orderList,
            orderNum:randomStringGenerator(),
        })
        await newOrder.save();
        res.status(200).json({status:"success",orderNum:newOrder.orderNum});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports=orderController;