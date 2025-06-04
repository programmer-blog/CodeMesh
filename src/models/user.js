const { default: mongoose } = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLenght: 100
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: String,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://png.pngtree.com/element_pic/16/12/07/921c6d12350e366ee4af07eb9055ab40.jpg"
    },
    about: {
        type: String,
        default: "This is default value"
    },
    skills: {
        type: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);;