require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(process.env.CUSTOMCONNSTR_MyConnectionString||"mongodb://localhost:27017/taskDB")
.then(() => {
    console.log("Connection Successful");
}).catch((e) =>{
    console.log("Connection not successful");
})