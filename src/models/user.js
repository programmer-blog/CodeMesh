const { default: mongoose } = require("mongoose")
const validator = require('validator');

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
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address',
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                });
            },
            message:
                'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
        },
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
        default: "https://png.pngtree.com/element_pic/16/12/07/921c6d12350e366ee4af07eb9055ab40.jpg",
        validate: {
            validator: (value) => validator.isURL(value),
            message: 'Please enter a valid URL',
        },
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