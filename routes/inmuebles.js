const express = require('express');
const Inmueble = require('../models/inmueble');
const router = express.Router();
const fs = require("fs");
const rimraf = require('rimraf');
const gestToken = require('../utils/gestToken');

gestToken.passport.use(
    new gestToken.Strategy({secretOrKey: gestToken.secreto, jwtFromRequest: gestToken.ExtractJwt.fromAuthHeaderAsBearerToken()},
    (payload, done) => {
        console.log(payload);

    if (payload.id) {
        return done(null, { id: payload.id });
    } else {
        return done(new Error("Usuario incorrecto"), null);
    }
}));

router.get('/', (req, res) => {
    Inmueble.find().populate('tipos').then(resultado => {
        resultado.forEach(element => {
            element.imagen = (fs.readdirSync("./public/imgs/inmuebles/" + element._id + "/"))[0];
        });

        res.render('listar_inmuebles', {
            inmuebles: resultado
        });
    }).catch(error => {
        res.render('listar_inmuebles', {
            inmuebles: []
        });
    });
});

router.post('/types', (req, res) => {
    console.log(req.body);
    Inmueble.find({ tipo: req.body.tipo }).populate('tipos').then(resultado => {
        resultado.forEach(element => {
            element.imagen = (fs.readdirSync("./public/imgs/inmuebles/" + element._id + "/"))[0];
        });

        res.render('listar_inmuebles', {
            inmuebles: resultado
        });
    }).catch(error => {
        res.render('listar_inmuebles', {
            inmuebles: []
        });
    });
});

router.post('/filter', (req, res) => {
    let url = "/inmuebles/";
    url += req.body.precio ? req.body.precio + "/" : "0/";
    url += req.body.m2 ? req.body.m2 + "/" : "0/";
    url += req.body.numHabitaciones ? req.body.numHabitaciones + "/" : "0/";

    res.redirect(url);
});

router.get('/edit/:id', gestToken.passport.authenticate('jwt', {session: false, failureRedirect:
    '/usuarios/login'}),(req, res) => {
    Inmueble.findById(req.params.id).populate('tipos').then((resultado) => {
        imagenes = fs.readdirSync("./public/imgs/inmuebles/" + resultado._id);
        console.log(resultado);
        res.render("nuevo_inmueble", { editando: true, nuevoError: false, inmueble: resultado, imagenes: imagenes });
    });
});

router.post('/edit/:id', (req, res) => {
    Inmueble.findById(req.params.id).populate('tipos').then((resultado) => {
        console.log(resultado);

        // actualiza los datos.
        preupdate(req.body, resultado);
        resultado.save(function (err, respuesta) {
            if (err) return handleError(err);
            console.log("saved");
        });

        // borra las imagenes seleccionadas.
        const inmueblePath = "./public/imgs/inmuebles/" + resultado._id + "/";
        imagenes = fs.readdirSync("./public/imgs/inmuebles/" + resultado._id);
        imagenes.forEach((imagen) => {
            console.log(imagen + " == " + req.body[imagen]);
            if (req.body[imagen] && req.body[imagen] == "on") {
                rimraf(inmueblePath + imagen, () => {
                    console.log("borrando " + imagen);
                });
            }
        });

        // guardamos las nuevas imagenes.
        const promesas = [];
        if (req.files.imagenes) {
            if (!Array.isArray(req.files.imagenes))
                req.files.imagenes = [req.files.imagenes];

            req.files.imagenes.forEach((element, index) => {
                promesas.push(moveImage(req, res, index, inmueblePath));
            });
        }

        Promise.all(promesas).then(() => {
            res.redirect("/inmuebles/" + resultado._id);
        }).catch(err => console.log(err));

    });
});

router.delete('/:id', gestToken.passport.authenticate('jwt', {session: false, failureRedirect:
    '/usuarios/login'}),(req, res) => {
    Inmueble.findByIdAndRemove(req.params.id).then(respuesta => {
        console.log(respuesta);
        rimraf('./public/imgs/inmuebles/' + respuesta._id, () => {
            res.end(JSON.stringify({ok: true}));
        });
    }).catch((err) => {
        console.log("ERROR" + err);
        res.end(JSON.stringify({ ok: false, errorstatus: "error deleting the inmueble" }));
    });
});

router.get('/:id', (req, res) => {
    Inmueble.findById(req.params.id).populate('tipo').then(resultado => {
        if (resultado) {
            let imagenes = [];

            imagenes = fs.readdirSync("./public/imgs/inmuebles/" + resultado._id);

            res.render('ficha_inmueble', {
                error: false,
                inmueble: resultado,
                imagenes: imagenes
            });
        } else
            res.redirect("/inmuebles");
    });
});



router.post('/', (req, res) => {

    console.log(req.body);

    const nuevoInmueble = new Inmueble(req.body);

    nuevoInmueble.save().then(resultado => {
        const inmueblePath = "./public/imgs/inmuebles/" + resultado._id + "/";
        const promesas = [];

        fs.mkdirSync(inmueblePath);

        if (req.files.imagenes) {
            if (!Array.isArray(req.files.imagenes))
                req.files.imagenes = [req.files.imagenes];

            req.files.imagenes.forEach((element, index) => {
                promesas.push(moveImage(req, res, index, inmueblePath));
            });
        }

        Promise.all(promesas).then(() => {
            res.redirect("/inmuebles/" + resultado._id);
        }).catch(err => console.log(err));

    }).catch(error => {
        console.log("ERROR Validando:", error);
        console.log(req.body);
        res.render("nuevo_inmueble", {
            inmueble: req.body,
            nuevoError: true,
            mensaje: "",
            editando: true
        });
    });
});

router.get('/:precio/:superficie/:habitaciones', (req, res) => {

    return new Promise((resolve, reject) => {

        let filters = {};
        filters.precio = req.params.precio != 0 ? { $lte: req.params.precio } : { $lte: 99999999 };
        filters.m2 = req.params.superficie != 0 ? { $gte: req.params.superficie } : { $gte: 0 };
        filters.numHabitaciones = req.params.habitaciones != 0 ? { $gte: req.params.habitaciones } : { $gte: 0 };
        resolve(filters);

    }).then(filters => {

        console.log(filters);

        Inmueble.find(filters).populate('tipos').then(resultado => {
            console.log(resultado);
            resultado.forEach(element => {
                element.imagen = (fs.readdirSync("./public/imgs/inmuebles/" + element._id + "/"))[0];
            });

            res.render('listar_inmuebles', {
                inmuebles: resultado
            });
        }).catch(error => {
            res.render('listar_inmuebles', {
                inmuebles: []
            });
        });

    }).catch(err => console.log(err));
});

function preupdate(formBody, inmueble) {
    inmueble.descripcion = formBody.descripcion;
    inmueble.tipo = formBody.tipo;
    inmueble.numHabitaciones = formBody.numHabitaciones;
    inmueble.m2 = formBody.m2;
    inmueble.precio = formBody.precio;
}

function moveImage(req, res, index, path) {
    // creamos un nombre aleatorio para cada imagen, le ponemos su antigua extensión y la movemos a la carpeta.
    return new Promise((resolve, reject) => {
        const randName = new Date().getTime() + index;
        const extensionLength = req.files.imagenes[index].name.includes('jpeg') ? 4 : 3;
        const ext = req.files.imagenes[index].name.substring(req.files.imagenes[index].name.length - extensionLength, req.files.imagenes[index].name.length);

        console.log(req.files.imagenes[index].name);
        console.log("ahora es");
        console.log(randName + "." + ext);

        req.files.imagenes[index].mv(path + randName + "." + ext, (err) => {
            if (err) {
                console.log(err);
                res.redirect("/");
                return res.status(500).send("Error subiendo fichero");
                reject();
            }

            resolve();
        });
    });
}

module.exports = router;