const express = require('express');
const { createServer } = require("http");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const axios = require('axios');

const { dbConnection } = require('../database/config');

class Servidor {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;
        this.server = createServer(this.app);

        this.paths = {
            images:    '/api/images',
            auth:      '/api/login',
            dataset:   '/api/dataset'
        }


        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

    }

    async conectarDB() {
        await dbConnection();
    }


    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );
        this.app.use( '/login',  express.static('public/login.html'));
        this.app.use( '/admin',  express.static('public/admin.html'));

        //Fileupload - carga de archivos
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

    }

    routes() {
        this.app.use( this.paths.images, require('../routes/images'));
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.dataset, require('../routes/dataset'));
    }


    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




module.exports = {Servidor};
