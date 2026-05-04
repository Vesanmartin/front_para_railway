const express = require('express');
const router = express.Router();

const {
    getGestion,
    crearGestion,
    actualizarGestion,
    eliminarGestion
} = require('../controllers/gestionController');

// Obtener todos los datos
router.get('/gestion', getGestion);

// Crear un nuevo dato
router.post('/gestion', crearGestion);

// Actualizar un dato por id
router.put('/gestion/:id', actualizarGestion);

// Eliminar un dato por id
router.delete('/gestion/:id', eliminarGestion);

module.exports = router;