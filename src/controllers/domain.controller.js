const apiCtrl = {};
const config = require('../config/settings');
const mongoose = require('mongoose');
const Editable = require('../models/Editable');
const Order = require('../models/Order');

const Errorl = require('../models/Errorl');
const User = require('../models/User');


const DvService = require('../services/serv.db');

















  apiCtrl.intercambiador = async (req, res, next) => {
    try {     
        res.render('interc');
    } catch (error) {
      next(error);
    }
};






apiCtrl.renderPedidos = async (req, res, next) => {
    const panel = {
        "boton-xls":false,
        "boton-pagination":true,
        "boton-opciones":true,
        "titulo":"Pedidos"
    };

    try {     
        res.render('ventas/pedidos',{panel});
    } catch (error) {
        next(error);
    }
};











esFecha = (valor) => {
    const dateObject = new Date(valor);
    return dateObject instanceof Date && !isNaN(dateObject.getTime());
}

esNumero = (valor) => {
    return typeof valor === 'number';
}

module.exports = apiCtrl  ;