const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        const users = await User.find({}, "name email role");
        console.log("Users found:", users);
        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
