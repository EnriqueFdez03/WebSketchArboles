const path = require('path');
const uniquefilename = require('uniquefilename');
const fs = require('fs');  

const subirImagen = ( files, especie ) => {
    return new Promise( (resolve, reject) =>{
        const { image } = files;
    
        uniquefilename.get(path.join(__dirname, `../images/Plantas/${especie}/${image.name}`), {separator: '-'})
                            .then((path) => { 
                                image.mv(path, function(err) {
                                    if (err) {
                                        console.log(err);
                                        return reject(err);
                                    } 
                                    return resolve(path); //si va todo bien en la promesa retornamos el path a donde ha ido el sketch.
                                });
                            });
    });
}

//dado un path, retorna un archivo aleatorio de todos los subpaths que haya.
const getImagen = async (src) => {
    const readdir = fs.promises.readdir;
    const directorios = (await readdir(src, { withFileTypes: true }))
                            .filter(dirent => dirent.isDirectory())
                            .map(dirent => dirent.name);

    const elegido = directorios[Math.floor(Math.random()*directorios.length)];
    const archivos = await readdir(path.join(src,elegido), (err,files) => {
                            if (err) {
                                throw new Error(err);
                            }
                            resolve(files);
                        }); 

    const archivo = archivos[Math.floor(Math.random()*archivos.length)];
    return {elegido, archivo};
} 



const subirSketch = (name, especie, files) => {
    return new Promise( (resolve, reject) =>{
        const { image } = files;
        
        uniquefilename.get(path.join(__dirname, `../images/Bocetos/${especie}/${name}`), {separator: '_'})
                            .then((path) => { 
                                image.mv(path, function(err) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    return resolve(path); //si va todo bien en la promesa retornamos el path a donde ha ido el sketch.
                                });
                            });
    });
}

const borrarImagenPath = (pathImagen) => {
    if ( fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = {
    subirImagen,
    subirSketch,
    borrarImagenPath,
    getImagen
}