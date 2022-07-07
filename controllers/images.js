const { response } = require("express");
const { subirImagen, subirSketch, borrarImagenPath, getImagen } = require("../helpers/gestion-imagenes");
const path = require('path');

const cargarArchivo = async(req,res = response) => {

    subirImagen(req.files, req.params.especie)
        .then(path => {
            res.status(201).json({
                path
            });
        })
        .catch(err => {
            res.status(400).json({
                err
            });
        });

}

const cargarSketch = async(req,res=response) => {
    const { especie, nombre } = req.params;
    
    try {
        const pathSketch = await subirSketch(nombre, especie, req.files);
        res.status(201).json({
            pathSketch
        });
    } catch(err) {
        res.status(400).json({
            err
        });
    }
}

const siguienteImagen = async(req,res=response) => {

    getImagen(path.join(__dirname, '../images/Plantas'))
            .then(({elegido, archivo}) => {
                res.status(200).json({
                    "especie": elegido,
                    "nombre": archivo
                });
            })
            .catch((err) => {
                res.status(204).json({
                    msg: err.message,
                    detalle: "No se pudo obtener una imagen"
                });
            });
}


const mostrarImagen = async(req, res = response) => {
    const { especie, nombre } = req.params;
    const pathImg = path.join(__dirname, `../images/Plantas/${especie}/${nombre}`);
    
    res.status(200).sendFile(pathImg, (err) => {
        if(err) {
            console.log(err);
        }
    });
}

const mostrarSketch = async(req, res = response) => {
    const { especie, nombre } = req.params;
    const pathImg = path.join(__dirname, `../images/Bocetos/${especie}/${nombre}`);

    res.status(200).sendFile(pathImg, (err) => {
        if(err) {
            console.log(err);
        }
    });
}

const eliminarImagen = (req,res=response) => {
    const { especie, nombre } = req.params;

    borrarImagenPath( path.join(__dirname, `../images/Plantas/${especie}/${nombre}`));
    return res.status(200).json({msn: "Todo fue bien"});
}

const eliminarSketch = (req,res=response) => {
    const { especie, nombre } = req.params;

    borrarImagenPath( path.join(__dirname, `../images/Bocetos/${especie}/${nombre}`));
    return res.status(200).json({msn: "Todo fue bien"});
}


module.exports = {
    cargarArchivo,
    mostrarImagen,
    mostrarSketch,
    siguienteImagen,
    eliminarImagen,
    eliminarSketch,
    cargarSketch
}