const mongoose = require("mongoose");
const User = require("../model/user.model");

async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL);

        // Users created before role-based access existed receive a persisted
        // default role, so the field is visible in MongoDB as well.
        const migration = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: "student" } },
        );
        console.log(`connected to mongoDB; ${migration.modifiedCount} existing user role(s) initialized`);
    }catch(err){
        console.log(err);
    }
}

module.exports = connectToDB;
