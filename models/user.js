const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ''

    },
    city: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        required: true
    },
});

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});
userSchema.set('toJSON', {
    virtuals: true
});



module.exports = mongoose.model('User', userSchema);