const { Router } = require('express');

const { cargarArchivo, mostrarImagen, siguienteImagen, eliminarImagen, eliminarSketch, cargarSketch, mostrarSketch } = require('../controllers/images');
const { validarArchivoSubir } = require('../middlewares/validar-archivo');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const router = Router();

router.post( '/:especie/:nombre', [
    validarJWT,
    validarArchivoSubir,
    validarCampos
], cargarArchivo );

router.post('/sketch/:especie/:nombre', [
    validarArchivoSubir,
], cargarSketch);

router.get( '/next', siguienteImagen);

router.get( '/:especie/:nombre', mostrarImagen); 

router.get( '/sketch/:especie/:nombre', mostrarSketch); 


router.delete( '/:especie/:nombre', [validarJWT,validarCampos], eliminarImagen );
router.delete( '/sketch/:especie/:nombre', [validarJWT,validarCampos], eliminarSketch );

module.exports = router;