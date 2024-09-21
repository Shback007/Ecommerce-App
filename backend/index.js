const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//Database Connection with MongoDB
mongoose.connect("mongodb+srv://Shback007:Gameismylife1234@cluster0.wmkbj.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0/")
//API creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage: storage})

//Creating Upload Endpoint for images 

app.use('/images',express.static('upload/images'))

app.post("/upload", upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for creating Products

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type: Number,
        required:true,
    },
    old_price:{
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true,
    },

},"Products")

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length >0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    })
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
    
})

//Creating API for deleting products

app.post('/removeproduct', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.body.id });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log("Removed:", product);
        res.json({
            success: true,
            message: `Product with id ${req.body.id} was removed`,
        });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while removing the product',
        });
    }
});

//creating API for getting all products
app.get('/allproducts', async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port"+port);
    }
    else{
        console.log("Error:"+error);
    }
})
