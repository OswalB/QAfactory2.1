const { 
    contenido,
    keys,
    guardar
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
const Serial = require('../models/Serial');


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
        data.sortObject = {nombre:1};
        data.otrosMatch = [];  
        data.proyectar =[{nombre:1}, {_id:0}, {idClient:1}]    ;     
        if(user.administrador || user.despachador){
            
        }else if(user.vendedor){
            data.otrosMatch.push({idSeller:user.salesGroup});
            }else{
                data.otrosMatch.push({idClient:user.ccnit});
        };
        response = await contenido(data);
            res.json(response);
    } catch (error) {
      next(error);
    }
};

apiCtrl.sugeridos = async (req, res, next) => {
    try {     
        const data = req.body, user = req.user;
        let response;
        const pipeline =[
            {
              $match: {
                nit: data.noc, 
                createdAt: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() - data.k))
                }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 4 },
            { $unwind: "$orderItem" },
            {
              $group: {
                _id: "$orderItem.code",
                avgQty: { $avg: "$orderItem.qty" }
              }
            },
            { $addFields: { avgQty: { $ceil: "$avgQty" } } },
            { $project: { _id: 0, code: "$_id", product: 1, avgQty: 1 } }
          ];
        response = await Order.aggregate(pipeline);  

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
        if(data.fx === 'a'){
            data.modelo = 'Averia';
            if(user.administrador || user.despachador){
                data.otrosMatch.push({
                    firmado:false,
                });
            }else{
                data.otrosMatch.push({
                    firmado:false,
                    seller:user.ccnit,
                });
            }
            data.saltar =0;
            data.limitar =0;
            data.sortObject = {consecutivo:1};

            data.proyectar.push({consecutivo:1},{createdAt:1},{client:1},{_id:0},{orderItem:1})

            response = await contenido(data);
            res.json(response);
            return;
        }
       if(data.fx === 'k'){
        response = await keys(data);
        res.json(response);
        return;
       }
       if(data.fx === 'c'){
            
            data.sortObject.createdAt = -1;
            if(user.administrador || user.despachador){
            }else if(user.vendedor){
                data.otrosMatch.push({seller:user.salesGroup});
                }else{
                    data.otrosMatch.push({nit:user.ccnit});
            };

            if(data._id){   
                data.saltar = 0;
                data.otrosMatch.push({_id: new ObjectId(data._id) });
                data.proyectar.push({client:1},{id_compras:1},{totalReq:1},{TotalDisp:1},
                    {delivery:1},{createdAt:1},{state:1},{notes:1},{sellerName:1},{vendedor:1},
                    {'orderItem.product':1},{'orderItem.qty':1},{'orderItem.dispatch':1},{'orderItem.code':1}
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
        "boton-averias":true,
        "titulo":""
    };

    try {     
        res.render('ventas/pedidos',{panel});
    } catch (error) {
        next(error);
    }
};

apiCtrl.saveAverias = async (req, res, next) => {
    try { 
        const data = req.body, user = req.user;
        let response;
        lastId = await Serial.findOne();
        if(!lastId ){
          let newSerial = await new Serial({'consecutivo':0, serialAverias:0});
          await newSerial.save();
          lastId = await Serial.findOne();
        }
        let counter = lastId.serialAverias += 1;
        await Serial.updateOne({"_id": lastId._id},{$set: {'serialAverias': counter}});
        data.documentos[0].consecutivo = counter;
        data.documentos[0].seller = user.ccnit;
        data.documentos[0].sellerName = user.name;
        response = await guardar(data);
        res.json(response);
    }catch(error){
        next(error);
    }
}

apiCtrl.savePedido = async (req, res, next) => {
    try {
        const data = req.body, user = req.user; 
        let response;
        data.documentos[0].seller = user.salesGroup;
        data.documentos[0].sellerName = user.name;
        response = await guardar(data);
        res.json(response);
    }catch(error){
        next(error);
    }
}

apiCtrl.salesProducts= async (req, res, next) => {
    try {     
        const data = req.body;
        let response;
        data.modelo = 'Product';
        data.sortObject = {categoria:1, nombre:1};
        data.otrosMatch = [];  
        data.proyectar =[{nombre:1}, {_id:0}, {categoria:1}, {codigo:1}, {corto:1}];     
        response = await contenido(data);
            res.json(response);
    } catch (error) {
      next(error);
    }
};

module.exports = apiCtrl  ;