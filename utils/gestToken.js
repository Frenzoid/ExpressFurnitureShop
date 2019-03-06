 const secreto = "secretoDAW";
 const passport = require('passport');
 const {Strategy, ExtractJwt} = require('passport-jwt');
 const jwt = require('jsonwebtoken');
 let generarToken = (id) => {
    console.log(id);
    let token = jwt.sign({id: id}, secreto, {expiresIn: "2 hours"});
    console.log(token);
    return token;
}

module.exports = {
    secreto:secreto,
    passport:passport,
    Strategy: Strategy,
    ExtractJwt: ExtractJwt,
    jwt: jwt,
    generarToken: generarToken
};