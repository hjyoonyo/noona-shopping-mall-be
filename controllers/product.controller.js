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

// const pageSize = 5; //페이지 당 보여줄 상품 갯수
productController.getProduct = async (req,res) => {
    try {
        const {page,name,pageSize} = req.query;
        // if(name){
        //     const products = await Product.find({name:{$regex:name,$options:"i"}}) //$regex:name => 포함된, $option:"i" => case insensitive
        // }else{
        //     const products = await Product.find({});
        // }
        // console.log("product legnth ", product.length);
        const cond = { isDeleted: false, ...(name ? { name: { $regex: name, $options: "i" } } : {}) };
        let query = Product.find(cond).sort({ createdAt:-1}); //선언
        let response = {status:"seccess"};
        //페이지 처리
        if(page){
            query.skip(pageSize*(page-1)).limit(pageSize);
            //최종 페이지 수
            //데이터 총 몇개
            const totalItemNum = await Product.countDocuments(cond);
            const totalPageNum = Math.ceil(totalItemNum/pageSize);
            response.totalPageNum=totalPageNum;
        }
        const productList = await query.exec(); //실행
        response.data = productList
        return res.status(200).json(response);
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

productController.updateProduct= async (req,res)=>{
    try {
        const productId = req.params.id;
        const {sku,name,size,image,price,description,category,stock,status,} = req.body;
        
        const product = await Product.findByIdAndUpdate(
            { _id:productId},
            { sku,name,size,image,price,description,category,stock,status},
            { new: true}
        );
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status:"success",data:product});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

productController.deleteProduct = async (req,res)=>{
    try {
        const productId = req.params.id;
        const isDeleted = true;
        const ProductDeleted = await Product.findByIdAndUpdate({_id:productId},{isDeleted},{new:true});
        if(!ProductDeleted) throw new Error("item doesn't exist");
        
        res.status(200).json({status:"success",message: "Product deleted successfully"});
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

productController.getProductDetail = async (req,res)=>{
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status:"success",data:product}); 
    } catch (error) {
        res.status(400).json({status:"fail",error:error.message});
    }
}

module.exports = productController;