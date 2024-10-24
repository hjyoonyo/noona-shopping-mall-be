const express = require('express'); //백엔드
const mongoose = require('mongoose'); //DB
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require("dotenv").config()
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json()) //req.body가 객체로 인식

const mongoURI = process.env.LOCAL_DB_ADRESS;
mongoose.connect(mongoURI,{useNewUrlParser:true}).then(()=>console.log("mongoose connected")).catch((err)=>console.log("DB connection fail"));

app.listen(process.env.PORT || 5000,()=>{
    console.log("server on");
})