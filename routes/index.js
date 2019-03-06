const express = require('express');
let router = express.Router();
const tipos = require('../models/tipo');
const gestToken = require('../utils/gestToken');

gestToken.passport.use(new gestToken.Strategy({
    secretOrKey: gestToken.secreto, jwtFromRequest: gestToken.ExtractJwt.fromAuthHeaderAsBearerToken()
}, (payload, done) => {
    console.log(gestToken.ExtractJwt.fromAuthHeaderAsBearerToken());
    if (payload.id) {
        return done(null, { id: payload.id });
    } else {
        return done(new Error("Usuario incorrecto"), null);
    }
}));


router.get('/', (req, res) => {
    res.render('index');
});

router.get('/nuevo_inmueble', gestToken.passport.authenticate('jwt', {session: false}),(req, res) => {
    res.render('nuevo_inmueble', {editando: false, nuevoError: false});
});

module.exports = router;