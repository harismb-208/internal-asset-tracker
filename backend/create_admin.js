const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        const email = "admin@local.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`User ${email} already exists.`);
            // Update password just in case
            existing.password = hashedPassword;
            await existing.save();
            console.log("Password updated to: " + password);
        } else {
            const user = await User.create({
                name: "Local Admin",
                email,
                password: hashedPassword,
                role: "ADMIN",
            });
            console.log("Admin user created:", user);
        }

        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
