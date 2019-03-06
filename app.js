const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const principal = require('./routes/index.js');
const inmuebles = require('./routes/inmuebles');
const tipos = require("./routes/tipos");
const tipoClass = require("./models/tipo");
const usuarios = require("./routes/usuarios");
const cors = require('cors');
const gestToken = require('./utils/gestToken');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/inmuebles', {
    useMongoClient: true
});

// let tiposArr = [{tipo: 'Atico'}, {tipo: 'Piso'}, {tipo: 'Bungalow o adosado'}, {tipo: 'Chalet'}, {tipo: 'Planta baja'}];

// tiposArr.forEach(element => {
//     let tipo = new tipoClass(element);
//     tipo.save();
// });

const app = express();

app.use(fileUpload());
app.use(cors());
app.set('view engine', 'ejs');
app.use('/public', express.static('./public'));
app.use(bodyParser.json());
app.use(gestToken.passport.initialize());
// insertamos los tipos en todas las vistas.

app.use((req, res, next) => {
    tipoClass.find().then(resultado => {
        res.locals.tipos = resultado;
        next();
    }).catch(error => {
        res.locals.tipos = [];
        next();
    });
});


app.use('/usuarios', usuarios);
app.use('/tipos', tipos);
app.use('/inmuebles', inmuebles);
app.use('/', principal);

app.listen(8080);