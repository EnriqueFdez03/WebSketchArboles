const { response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const { generarJWT } = require('../helpers/generar-jwt');


const login = async(req, res = response) => {

    const { username, password } = req.body;

    try {
      
        // Verificar si el usuario existe
        const user = await User.findOne({ username });
        
        if ( !user ) {
            return res.status(400).json({
                msg: `No hay usuario con username ${username} en la BBDD`
            });
        }

        // SI el usuario está activo
        if ( !user.status ) {
            return res.status(400).json({
                msg: `El usuario fue deshabilitado`
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, user.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: `La contraseña no es correcta`
            });
        }

        // Generar el JWT
        const token = await generarJWT( user.id );
  
        res.json({
            user,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error de backend. Habla con admin.'
        });
    }   

}

module.exports = {
    login
};