const mongoose = require("mongoose");

async function connectToDB(){
    try{
        mongoose.connect(process.env.MONGO_URL)
        console.log("connected to mongoDB")
    }catch(err){
        console.log(err);
    }
}

module.exports = connectToDB;