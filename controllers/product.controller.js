const Product = require("../models/Product");
const productController = {};
productController.createProduct = async (req,res) => {
    try {
        const {sku,name,size,image,category,description,price,stock,status}=req.body;
        const product = new Product({sku,name,size,image,category,description,price,stock,status});
        
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
productController.checkStock = async(item)=>{
    //내가 사려는 아이템 재고 정보
    const product = await Product.findById(item.productId);
    //내가 사려는 아이템 qty, stock 비교
    if(product.stock[item.size] < item.qty){
        //stock 불충분하면 메세지&데이터반환
        return {isVerify:false,message:`${product.name}의 ${item.size} 사이즈 재고가 부족합니다.`}
    }

    return {isVerify:true};
}

productController.checkItemListStock = async(itemList)=>{
    try {
        const insufficientStockItems = [];
        //재고 확인
        await Promise.all( //여러 비동기 작업을 한꺼번에(동시에) 처리함.
            itemList.map(async (item)=>{
                const stockCheck = await productController.checkStock(item);

                if(!stockCheck.isVerify){
                    insufficientStockItems.push({item,message:stockCheck.message});
                }
                return stockCheck;
            })
        );

        //stock 충분하면 stock-qty 성공
        if(insufficientStockItems.length === 0){
            for (const item of itemList) {
                const product = await Product.findById(item.productId);
        
                const newStock = { ...product.stock };
                       
                // 사이즈에 맞는 재고 차감
                newStock[item.size] -= item.qty;
        
                product.stock = newStock;
                await product.save();
            }
        }

        return insufficientStockItems;
    } catch (error) {
        
    }
}

module.exports = productController;