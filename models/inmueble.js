const mongoose = require('mongoose');
const tipo = require('./tipo');

let inmuebleSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: true,
        minlength: 10,
        trim: true
    },
    tipo: { type: mongoose.Schema.Types.ObjectId, ref: 'Tipo', required: true },
    numHabitaciones: {
        type: Number,
        required: true,
        min: 1
    },
    m2: {
        type: Number,
        required: true,
        min: 25
    },
    precio: {
        type: Number,
        required: true,
        min: 10000
    }
});



let Inmueble = mongoose.model('Inmueble', inmuebleSchema);

module.exports = Inmueble;