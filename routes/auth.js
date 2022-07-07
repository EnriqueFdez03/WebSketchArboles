const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');

const { login } = require('../controllers/auth');
const { validarJWT } = require('../middlewares/validar-jwt');


const router = Router();

router.post('/',[
    check('username', 'El username es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login );

router.post('/validate', validarJWT, (req,res) => {
    res.status(200).json({msg: "El token es válido"});
});


module.exports = router;