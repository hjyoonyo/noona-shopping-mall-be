const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");

const orderSchema = Schema({
    userId:{type:mongoose.ObjectId,ref:User,required:true},
    status:{type:String,required:true,default:"preparing"},
    totalPrice:{type:Number,required:true,default:0},
    shipTo:{type:Object,required:true},
    contact:{type:Object,required:true},
    orderNum:{type:String},
    items:[{
        productId:{type:mongoose.ObjectId,ref:Product,required:true},
        qty:{type:Number,default:1,required:true},
        size:{type:String,required:true},
        price:{type:Number,required:true}
    }]

},{timestamps:true})

orderSchema.methods.toJSON = function(){
    const obj = this._doc;
    delete obj.__v;
    delete obj.updateAt;
    return obj;
}

orderSchema.post("save",async function(){
    //카트 비우기
    const cart = await Cart.findOne({userId:this.userId});
    cart.items=[];
    await cart.save();
})

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;
