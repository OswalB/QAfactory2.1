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
const Product = require('../models/Product');
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

apiCtrl.misClientes = async (req, res, next) => {
    try {     
        const data = req.body, user = req.user;
        let response;
        data.modelo = 'Client';
        data.sortBy = 'nombre';
        data.otrosMatch = [];  
        data.proyectar =[{nombre:1}, {_id:0}, {idClient:1}]    ;     
        if(user.administrador || user.despachador){
            
        }else if(user.vendedor){
            data.otrosMatch.push({idSeller:user.salesGroup});
            }else{
                data.otrosMatch.push({idClient:user.ccnit});
        };
        console.log(data)
        response = await contenido(data);
            res.json(response);
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
            };

            if(data._id){   
                data.saltar = 0;
                data.otrosMatch.push({_id: new ObjectId(data._id) });
                data.proyectar.push({client:1},{id_compras:1},{totalReq:1},{TotalDisp:1},
                    {delivery:1},{createdAt:1},{state:1},{notes:1},{sellerName:1},{vendedor:1},
                    {'orderItem.product':1},{'orderItem.qty':1},{'orderItem.dispatch':1},
                    );
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

apiCtrl.salesProducts= async (req, res, next) => {
    try {     
        const data = req.body;
        let response;
        data.modelo = 'Product';
        data.sortBy = ['categoria', 'nombre'];
        data.otrosMatch = [];  
        data.proyectar =[{nombre:1}, {_id:0}, {categoria:1}, {codigo:1}];     
        
        console.log(data)
        response = await contenido(data);
            res.json(response);
    } catch (error) {
      next(error);
    }
};

module.exports = apiCtrl  ;