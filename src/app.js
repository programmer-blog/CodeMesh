const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/user", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.send("User Added Successfully");
        console.log("User Added Successfully");
    } catch (e) {
        res.status(500).json({ error: "An error occurred. Please try again later." + e });
        console.log(' Error' + e)
    }
});

app.get('/user', async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const users = await User.find({ emailId: userEmail });

        if ((users).length === 0) {
            res.status(404).send({ error: "User not found" })
        }

        res.send(users);
    } catch (e) {
        res.status(500).json({ error: "An error occurred. Please try again later." });
    }

});

app.patch("/user", async (req, res) => {
    const { _id, ...updateData } = req.body;
    if (!_id) {
        return res.status(400).send("User ID is required");
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidators: true
        });

        res.send(updateData);
    } catch (err) {
        res.status(400).send("Update failed: " + err.message);
    }
});

app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully.")
    } catch (err) {
        res.status(400).send("Something went wrong" + err);
    }
})

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users)
    } catch (e) {
        res.status(500).json({ error: "An error occurred. Please try again later." });
    }
});

connectDB()
    .then(() => {
        console.log("Database connection established");
    }).catch((err) => {
        console.error("Database cannot be connected!!");
    })

app.listen(7777, () => {
    console.log("Listening on port 7777");

});