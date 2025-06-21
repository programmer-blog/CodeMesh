const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const decodedObj = await jwt.verify(token, "DEVELOPER@social$123");
        const user = await User.findById(decodedObj._id);

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Authentication failed" });
    }

}

module.exports = { userAuth }