const mongoose = require('mongoose');
const validator = require('validator');
const bycrpt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {

            if (!validator.isEmail(value)) {

                throw new Error('invalid email address');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {

            if (value.includes('password')) {

                throw new Error('value must not contain password');
            }
        }



    },

    age: {
        type: Number,
        default: 0,
        validate(value) {

            if (!value < 0) {

                throw new Error('value must be a positive number');
            }
        }
    },

    token: [{

        token: {
            type: String,
            required: true
        }


    }],

    avatar:{
        type:Buffer
    }
},{timestamps:true});

userSchema.virtual('tasks',{ref:'Task',localField:'_id',foreignField:'owner'}); 

userSchema.methods.toJSON = function(){

    const user = this;

    const userObject = user.toObject();

    delete userObject.token;
    delete userObject.password;
    delete userObject.avatar;

    return userObject;

};

userSchema.methods.generateToken = async function () {


    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_TOKEN);

    user.token = user.token.concat({ token });

    await user.save();

    return token;

}

userSchema.statics.checkCredentials = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {


        throw new Error('Unable login');
    }

    const isMatch = await bycrpt.compare(password, user.password);

    if (!isMatch) {

        throw new Error('Unable login');
    }


    return user;


};
userSchema.pre('save', async function (next) {



    const user = this;

    if (user.isModified('password')) {

        user.password = await bycrpt.hash(this.password, 8);
    }
    next();
});

userSchema.pre('remove',async function(next){

    const user = this;
    await Task.deleteMany({ owner:user._id });
     next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;