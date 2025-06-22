const express = require("express");
const bcrypt = require('bcrypt');
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middlewares/auth');
// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // Validate input
        if (!emailId || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = user.getJWT();

        // Set cookie and respond
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        return res.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.emailId,
                firstName: user.firstName
            }
        });

    } catch (e) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({
            data: {
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    email: user.emailId
                }
            },
            message: "Profile data"
        });
    } catch (e) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, emailId, password, gender } = req.body;

        // Validate input
        if (!firstName || !emailId || !password) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            gender
        });

        await user.save();
        return res.status(201).json({ message: "User registered successfully" });

    } catch (e) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        return res.json(users);
    } catch (e) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills", "emailId", "password"];
        const isValidUpdate = Object.keys(updates).every(field => ALLOWED_UPDATES.includes(field));

        if (!isValidUpdate) {
            return res.status(400).json({ error: "Invalid updates" });
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(user);
    } catch (e) {
        console.error('Update error:', e);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/users/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({ message: "User deleted successfully" });
    } catch (e) {
        console.error('Delete error:', e);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Database connection and server start
connectDB()
    .then(() => {
        console.log("Database connection established");
        app.listen(7777, () => {
            console.log("Server running on port 7777");
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
        process.exit(1);
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;