const express = require('express');
const Usuario = require('../models/usuario');
const router = express.Router();
const fs = require("fs");
const gestToken = require('../utils/gestToken');

router.get('/registro', (req, res) => {
    res.render('registro', {
        error: false
    });
});

router.post('/registro', (req, res) => {
    console.log(req.body);
    if(req.body.password != req.body.password2 && req.body.username){
        console.log('register failed');
        res.render('registro', {
            error: true
        });
    }else{
        let usuario = new Usuario(req.body);
        usuario.save();
        res.redirect('/usuarios/login');
    }
});

router.get('/login', (req, res) => {
    res.render('login', {
        error: false
    });
});

router.post('/login', (req, res) => {
    console.log(req.body);
    Usuario.find({username: req.body.username, password: req.body.password}).then(usuario => {
        console.log(usuario.length);
        if(usuario.length == 0){
            console.log('login failed');
            res.render('login', {
                error: true
            });
        }else{
            let token =  gestToken.generarToken(usuario[0]._id);
            // console.log(token);
            res.send({ok: true, token: token});
        }
    });
});
module.exports = router;