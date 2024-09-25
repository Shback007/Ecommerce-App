const port = process.env.PORT || 4000;
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
const fs = require('fs');
app.post('/removeproduct', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.body.id });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        //Extract the image path from the product (full URL)
        const relativeImagePath = product.image.split(`http://localhost:${port}/`)[1];
        const imagePath = path.join(__dirname,'upload',relativeImagePath);

        fs.unlink(imagePath, (err) =>{
            if(err){
                console.error("Error deleting image file:", err);
                return res.status(500).json({
                    success:false,
                    message:'Failed to delete image file',
                });
            }
        })

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
    res.send(products);
})


// Schema Creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
},"Users")

//creating Endpoint for registering the user

const bcrypt = require('bcrypt');
const { log, error } = require("console");

app.post('/signup',async (req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart ={};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }

    const hashedPassword = await bcrypt.hash(req.body.password , 10);
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:hashedPassword,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

//Creating endpoint for user login

app.post('/login',async (req,res)=>{
    try{
        let user = await Users.findOne({email:req.body.email});
        if(user){
            const passCompare =  await bcrypt.compare(req.body.password,user.password)
            if(passCompare){
                const data = {
                    user:{
                        id:user.id
                    }
                }
                const token = jwt.sign(data,'secret_ecom');
                res.json({ success: true, token });
            }else{
                res.status(401).json({success:false,errors:"Wrong Password"});
            }
        }else{
            res.status(404).json({success:false,errors:"Wrong Email id"});
        }
    }catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
})

// creating endpoint for newcollection data
app.get('/newcollections', async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    res.send(newcollection);
    
})

// creating endpoint for popular in women section
app.get('/popularinwomen', async (req,res)=>{
    let products = await Product.find({category:"women"});
    let popularinwomen = products.slice(0,4);
    res.send(popularinwomen);
})

// creating middelware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try {
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors:"Please authenticate using a valid token"})
        }
    }
}

//creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser,async (req,res)=>{
    console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id})
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

// creating endpoint to remove product from cartdata 
app.post('/removefromcart',fetchUser,async (req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
        userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

// creating endpoint to get cartData
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port"+port);
    }
    else{
        console.log("Error:"+error);
    }
})
