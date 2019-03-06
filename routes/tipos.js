const express = require('express');
const Tipo = require('../models/tipo');
const router = express.Router();
const fs = require("fs");

router.get('/', (req, res) => {
    Tipo.find().populate('tipos').then(resultado => {
        res.end(JSON.stringify(resultado));
    }).catch((err) => {
        console.log(err);
        res.end(JSON.stringify({error: true, errorstatus: "error while doing the query"}));
    });
});

module.exports = router;