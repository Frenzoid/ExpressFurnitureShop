const mongoose = require('mongoose');

let tipoSchema = new mongoose.Schema({

    tipo: {
        type: String,
        required: true,
        trim: true
    }

});

let Tipo = mongoose.model('Tipo', tipoSchema);

module.exports = Tipo;