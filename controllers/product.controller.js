const Product = require("../models/Product");
const productController = {};
productController.createProduct = async (req,res) => {
    try {
        const {sku,name,size,image,category,description,price,stock,status}=req.body;
        const product = new Product({sku,name,size,image,category,description,price,stock,status});
        console.log("product ",product);
        await product.save();
        return res.status(200).json({status:"success",product});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

productController.getProduct = async (req,res) => {
    try {
        const products = await Product.find({});
        // console.log("product legnth ", product.length);
        return res.status(200).json({status:"success", data:products});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}


module.exports = productController;