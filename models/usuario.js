const mongoose = require('mongoose');

let tipoSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true,
        trim: true
    },
});

let Usuario = mongoose.model('Usuario', tipoSchema);

module.exports = Usuario;