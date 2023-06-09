const express = require('express');
const router = express.Router();

// Aquí puedes definir tus rutas y configuraciones de API

// Ejemplo de ruta de API
router.get('/users', (req, res) => {
  // Lógica de manejo de la ruta '/users'
});

// Exporta el router para que pueda ser utilizado como middleware
module.exports = router;