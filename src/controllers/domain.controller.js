const { 
    contenido,
    keys
} = require('../utilities/corefunctions')

const apiCtrl = {};
const ObjectId = require('mongodb').ObjectId;
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

apiCtrl.pedidos = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        data.modelo = 'Order';
        
       if(data.fx === 'k'){
        response = await keys(data);
        res.json(response);
        return;
       }
       if(data.fx === 'c'){
            console.log(data);
            
            if(user.administrador || user.despachador){
                console.log('tods')
            }else if(user.vendedor){
                console.log('vendedor');
                data.otrosMatch.push({seller:user.salesGroup});
                }else{
                    console.log('cliente');
                    data.otrosMatch.push({nit:user.ccnit});
            }
            if(data._id){   
                data.saltar = 0;
                data.otrosMatch.push({_id: new ObjectId(data._id) });
            }else{
                data.proyectar.push({TotalDisp:1},{client:1},{delivery:1},{state:1},{totalReq:1});

            }
            
            response = await contenido(data);
            res.json(response);
            return;
       }
        
        
    } catch (error) {
        next(error);
    }
}

apiCtrl.renderPedidos = async (req, res, next) => {
    const panel = {
        "boton-xls":false,
        "boton-pagination":true,
        "boton-nuevo":true,
        "boton-vista":true,
        "titulo":"Pedidos"
    };

    try {     
        res.render('ventas/pedidos',{panel});
    } catch (error) {
        next(error);
    }
};

module.exports = apiCtrl  ;