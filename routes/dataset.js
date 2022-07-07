const { Router } = require('express');
const { downloadDataset,obtenerFicheros } = require('../controllers/dataset');

const router = Router();

router.get('/', downloadDataset);
router.get('/ficheros', obtenerFicheros);

module.exports = router;