const { response } = require('express');
const glob = require('glob');
const AdmZip = require("adm-zip");
const path = require('path');


const downloadDataset = async(req, res = response) => {
    try {
        const zip = new AdmZip();
        zip.addLocalFolder(path.join(__dirname,`../images`));


        const fichero = zip.toBuffer();
        
        const today = new Date();
        const nombreFichero = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()},${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}.zip`;

        res.set('Content-Type','application/octet-stream');
        res.set('Content-Disposition',`attachment;filename=${nombreFichero}`);
        res.set('Content-Length',fichero.length);
        res.send(fichero);


    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Error de backend. Habla con admin.'
        });
    }   

}

const obtenerFicheros = (req, res = response) =>  {
    glob(path.join(__dirname,`../images/Plantas/*/*`), (err,fich) => {
        if (err) {
            res.status(500).json(err);
        } else {
            glob(path.join(__dirname,`../images/Bocetos/*/*`), (err,fich2) => {
                if (err) {
                    res.status(500).json(err);
                } else {
                    const especies = new Set();
                    const aux = (arr,esp) => {
                        return arr.map(function(x) {
                            const partes = x.split('/');
                            esp.add( partes[partes.length - 2]);
                            return {
                                'especie': partes[partes.length - 2],
                                'nombre': partes[partes.length - 1]
                            }
                        });
                    }
                    
                    res.status(200).json({
                        "Plantas": aux(fich,especies),
                        "Bocetos": aux(fich2,especies),
                        "Especies": Array.from(especies)
                    });
                
                }
            });
        }
    });
}

module.exports = {
    downloadDataset,
    obtenerFicheros
};