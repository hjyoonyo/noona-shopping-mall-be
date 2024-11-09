const { response } = require("express");
const Order = require("../models/Order");
const randomStringGenerator = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

const orderController ={};
const PAGE_SIZE = 3;

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

orderController.getOrder = async(req,res)=>{
    try {
        const {userId} = req;
        const orderList = await Order.find({userId})
            .sort({ createdAt: -1 })
            .populate({
                path:'items',
                populate:{
                    path:'productId',
                    model: "Product",
                }
            });
        
        
        res.status(200).json({status:"success",orderList:orderList});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

orderController.getOrderDetail = async(req,res)=>{
  try {
      const {id} = req.params;
      console.log("Dfs",id);
      const order = await Order.findById(id)
          .populate({
              path:'items',
              populate:{
                  path:'productId',
                  model: "Product",
              }
          });
      
      res.status(200).json({status:"success",data:order});
  } catch (error) {
      res.status(400).json({status:"fail",error:error.message});
  }
}

orderController.getOrderList = async (req,res)=>{
    try {
        const { page, ordernum } = req.query;
    
        let cond = {};
        if (ordernum) {
          cond = {
            orderNum: { $regex: ordernum, $options: "i" },
          };
        }
    
        const orderList = await Order.find(cond)
          .sort({ createdAt: -1 })
          .populate("userId")
          .populate({
            path: "items",
            populate: {
              path: "productId",
              model: "Product",
              select: "image name",
            },
          })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE);
        const totalItemNum = await Order.countDocuments(cond);
    
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({ status: "success", data: orderList, totalPageNum });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
}

orderController.updateOrder = async (req,res)=>{
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
          id,
          { status: status },
          { new: true }
        );
        if (!order) throw new Error("해당 주문 내역을 찾을 수 없습니다.");
    
        res.status(200).json({ status: "success", data: order });
      } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
      }
}

module.exports=orderController;