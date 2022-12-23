require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(process.env.CUSTOMCONNSTR_MyConnectionString||process.env.DATABASE_URL)
.then(() => {
    console.log("Connection Successful");
}).catch((e) =>{
    console.log("Connection not successful");
})