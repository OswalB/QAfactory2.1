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
const Averia = require('../models/Averia');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Errorl = require('../models/Errorl');
const User = require('../models/User');
const Serial = require('../models/Serial');
const Planilla = require('../models/Planilla');


const DvService = require('../services/serv.db');
const { response } = require('express');

apiCtrl.despachos = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        data.modelo = 'Order';
        if (data.fx === 'l') {
            data.modelo = 'Planilla';
            data.otrosMatch.push({ agotado: false });
            data.otrosMatch.push({ codigoProducto: data.code });
            data.sortObject = { loteOut: 1 };
            data.proyectar = [{ loteOut: 1 }, { fecha1: 1 }]
            response = await contenido(data);
            res.json(response);
        }
        if (data.fx === 'k') {
            response = await keys(data);
            res.json(response);
            return;
        }
        if (data.fx === 'c') {
            if (data.sw) {
                data.otrosMatch.push({ state: 0 })
            }
            if (data.oneId) {
                data.otrosMatch = [];
                data.otrosMatch.push({ _id: new ObjectId(data.oneId) });
                console.log('un solo id')
            }
            data.proyectar = [
                {
                    'orderItem': {
                        $map: {
                            input: '$orderItem',
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    {
                                        'lotesOk': {
                                            $reduce: {
                                                input: '$$item.historyDisp',
                                                initialValue: true,
                                                in: { $and: ['$$value', { $ne: ['$$this.loteVenta', ''] }] } // Verifica si todos los elementos de historyDisp.loteVenta están presentes
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                { sellerName: 1 }, { client: 1 }, { delivery: 1 }, { notes: 1 }, { state: 1 },
                { createdAt: 1 }, { totalReq: 1 }, { TotalDisp: 1 }
            ]
            response = await contenido(data);

            res.json(response);
            return;
        }
        if (data.fx === 'a') {
            const pipe = [
                {
                    '$match': {
                        'firmado': false
                    }
                }, {
                    '$sort': {
                        'createdAt': 1
                    }
                }
            ]
            response = await Averia.aggregate(pipe);
            res.json(response);
            return;

        }
        if (data.fx === 'q') {
            if (data.oneId) {
                const pipeline = [
                    {
                        '$match': {
                            '_id': new ObjectId(data.oneId)
                        }
                    }, {
                        '$project': {
                            'orderItem': {
                                '$map': {
                                    'input': '$orderItem',
                                    'as': 'item',
                                    'in': {
                                        '$mergeObjects': [
                                            '$$item', {
                                                'lotesOk': {
                                                    '$reduce': {
                                                        'input': '$$item.historyDisp',
                                                        'initialValue': true,
                                                        'in': {
                                                            '$and': [
                                                                '$$value', {
                                                                    '$ne': [
                                                                        '$$this.loteVenta', ''
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            },
                            'delivery': 1,
                            'state': 1,
                            'createdAt': 1,
                            'totalReq': 1,
                            'TotalDisp': 1
                        }
                    }, {
                        '$project': {
                            'orderItem.historyDisp': 0,
                            'orderItem.product': 0
                        }
                    }
                ]
                if (data.siAverias) {
                    response = await Averia.aggregate(pipeline);
                } else {
                    response = await Order.aggregate(pipeline);
                }

                response.unshift({ count: 0 })
                res.json(response);
                return;
            }
        }
    } catch (error) {
        next(error);
    }
}

apiCtrl.getEmbodegar = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        const pipeline = [
            {
                '$match': {
                    'formulaOk': true,
                    'embodegado': false,
                    'categoria': 'Empaque'
                }
            }, {
                '$project': {
                    'categoria': 1,
                    'loteOut': 1,
                    'fecha1': 1,
                    'operario': 1,
                    'producto': 1,
                    'codigoProducto': 1,
                    'cantProd': 1
                }
            }, {
                '$sort': {
                    'categoria': 1
                }
            }
        ]
        response = await Planilla.aggregate(pipeline)

        res.json(response);
    } catch (error) {
        next(error);
    }
}

apiCtrl.getHistory = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        const pipeline = [
            {
                '$match': {
                    '_id': new ObjectId(data.idDoc)
                }
            }, {
                '$unwind': {
                    'path': '$orderItem'
                }
            }, {
                '$match': {
                    'orderItem._id': new ObjectId(data.idItem)
                }
            }, {
                '$project': {
                    'orderItem.qty': 1,
                    'orderItem.dispatch': 1,
                    'orderItem.historyDisp': 1
                }
            }
        ]
        response = await Order.aggregate(pipeline)

        res.json(response);
    } catch (error) {
        next(error);
    }
}

apiCtrl.getHistoryAveria = async (req, res, next) => {
    try {
        console.log('historia averias');
        const data = req.body, user = req.user;
        let response;
        const pipeline = [
            {
                '$match': {
                    '_id': new ObjectId(data.idDoc)
                }
            }, {
                '$unwind': {
                    'path': '$orderItem'
                }
            }, {
                '$match': {
                    'orderItem._id': new ObjectId(data.idItem)
                }
            }, {
                '$project': {
                    'orderItem.qty': 1,
                    'orderItem.dispatch': 1,
                    'orderItem.historyDisp': [{
                        'loteVenta': '$orderItem.loteRepuesto',
                        'dspHistory': '$orderItem.dispatchBy',
                        'fechaHistory': '$orderItem.dispatchDate',
                        'qtyHistory': '$orderItem.dispatch',
                    }]
                }
            }
        ]
        response = await Averia.aggregate(pipeline)

        res.json(response);
    } catch (error) {
        next(error);
    }
}

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
        data.sortObject = { nombre: 1 };
        data.otrosMatch = [];
        data.proyectar = [{ nombre: 1 }, { _id: 0 }, { idClient: 1 }];
        if (user.administrador || user.despachador) {

        } else if (user.vendedor) {
            data.otrosMatch.push({ idSeller: user.salesGroup });
        } else {
            data.otrosMatch.push({ idClient: user.ccnit });
        };
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
        
        if (data.fx === 'k') {
            response = await keys(data);
            res.json(response);
            return;
        }
        if (data.fx === 'c') {

            data.sortObject.createdAt = -1;
            if (user.administrador || user.despachador) {
            } else if (user.vendedor) {
                data.otrosMatch.push({ seller: user.salesGroup });
            } else {
                data.otrosMatch.push({ nit: user.ccnit });
            };

            if (data._id) {
                data.saltar = 0;
                data.otrosMatch.push({ _id: new ObjectId(data._id) });
                data.proyectar.push({ client: 1 }, { id_compras: 1 }, { totalReq: 1 }, { TotalDisp: 1 },
                    { delivery: 1 }, { createdAt: 1 }, { state: 1 }, { notes: 1 }, { sellerName: 1 }, { vendedor: 1 }, {consecutivo:1}, {siOrder:1},
                    { 'orderItem.product': 1 }, { 'orderItem.qty': 1 }, { 'orderItem.dispatch': 1 }, { 'orderItem.code': 1 }
                );
            } else {
                data.proyectar.push({ TotalDisp: 1 }, { client: 1 }, { delivery: 1 }, { state: 1 }, { totalReq: 1 }, {consecutivo:1}, {siOrder:1});
            }

            response = await contenido(data);
            res.json(response);
            return;
        }


    } catch (error) {
        next(error);
    }
}

apiCtrl.renderDespachos = async (req, res, next) => {
    const panel = {
        "boton-xls": false,
        "boton-pagination": true,
        "boton-facturados": true,
        "boton-embodegar": true,
        "titulo": "Despachador"
    };

    try {
        res.render('ventas/despachos', { panel });
    } catch (error) {
        next(error);
    }
};

apiCtrl.renderPedidos = async (req, res, next) => {
    const panel = {
        "boton-xls": false,
        "boton-pagination": true,
        "boton-nuevo": true,
        "boton-vista": true,
        "boton-averias": true,
        "boton-cancelar": true,
        "titulo": ""
    };

    try {
        res.render('ventas/pedidos', { panel });
    } catch (error) {
        next(error);
    }
};

apiCtrl.salesProducts = async (req, res, next) => {
    try {
        const data = req.body;
        let response;
        data.modelo = 'Product';
        data.sortObject = { categoria: 1, nombre: 1 };
        data.otrosMatch = [];
        data.proyectar = [{ nombre: 1 }, { _id: 0 }, { categoria: 1 }, { codigo: 1 }, { corto: 1 }];
        response = await contenido(data);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

apiCtrl.saveAverias = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        lastId = await Serial.findOne();
        if (!lastId) {
            let newSerial =  new Serial({ serialOrders: 0, serialAverias: 0, serialPlanillas: 0 });
            await newSerial.save();
            lastId = await Serial.findOne();
        }
        let counter = lastId.serialAverias += 1;
        await Serial.updateOne({ "_id": lastId._id }, { $set: { 'serialAverias': counter } });
        data.documentos[0].consecutivo = counter;
        data.documentos[0].seller = user.ccnit;
        data.documentos[0].sellerName = user.name;
        response = await guardar(data);
        res.json(response);
    } catch (error) {
        next(error);
    }
}

apiCtrl.savePedido = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        const siEsPedido = data.documentos[0].siOrder;
        let response;
        lastId = await Serial.findOne();
        if (!lastId) {
            let newSerial =  new Serial({ serialOrders: 0, serialAverias: 0, serialPlanillas: 0 });
            await newSerial.save();
            lastId = await Serial.findOne();
        }
        
        let counter = siEsPedido?lastId.serialOrders: lastId.serialAverias;
        counter += 1;
        const fieldToUpdate = siEsPedido ? 'serialOrders' : 'serialAverias';
        await Serial.updateOne({ "_id": lastId._id }, { $set: { [fieldToUpdate]: counter } });
        data.modelo = 'Order';
        data.documentos[0].seller = user.salesGroup;
        data.documentos[0].sellerName = user.name;
        data.documentos[0].consecutivo = counter;
        response = await guardar(data);
        res.json(response);
    } catch (error) {
        next(error);
    }
}

apiCtrl.sugeridos = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        let response;
        const pipeline = [
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

apiCtrl.stateLotes = async (req, res, next) => {
    try {
        const data = req.body;
        let response;
        const obj = { modelo: 'Planilla' }
        obj.documentos = data;
        response = await guardar(obj);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

apiCtrl.setState = async (req, res, next) => {
    try {
        const data = req.body;
        let response;
        console.log(data);
        await Order.findByIdAndUpdate(data._id, { state: data.newValue }, { new: true })




        res.json({ msg: 'facturado:ok' });
    } catch (error) {
        next(error);
    }
};

apiCtrl.updateAveria = async (req, res, next) => {

    try {
        const data = req.body, user = req.user;
        await Averia.findOneAndUpdate(
            { _id: data.idDocument, 'orderItem._id': data.idItem },
            {
                $inc: { 'orderItem.$.dispatch': data.qtyHistory },
                $set: { 
                    'orderItem.$.loteRepuesto': data.loteVenta,
                    'orderItem.$.dispatchBy': user.alias
                }
            }
        );

        const query = {};
        query.modelo = 'Averia';
        query.sortObject = {};
        query.proyectar = [];
        query.otrosMatch = [{ _id: new ObjectId(data.idDocument) }, { 'orderItem._id': new ObjectId(data.idItem) }];
        const resultado = await contenido(query);
        res.status(200).json({ success: true, message: 'Operación completada con éxito', data: resultado });
    } catch (error) {
        next(error);
    }
}

apiCtrl.updateDespacho = async (req, res, next) => {
    try {
        const data = req.body, user = req.user;
        const updateObj = {
            $push: {
                'orderItem.$.historyDisp': {
                    fechaHistory: data.fechaHistory,
                    loteVenta: data.loteVenta,
                    qtyHistory: data.qtyHistory,
                    dspHistory: user.alias
                }
            },
            $inc: { 'TotalDisp': data.qtyHistory, 'orderItem.$.dispatch': data.qtyHistory }
        };
        await Order.findOneAndUpdate(
            { _id: data.idDocument, 'orderItem._id': data.idItem },
            updateObj,
        );

        const query = {};
        query.modelo = 'Order';
        query.sortObject = {};
        query.proyectar = [
            {
                'orderItem': {
                    $map: {
                        input: '$orderItem',
                        as: 'item',
                        in: {
                            $mergeObjects: [
                                '$$item',
                                {
                                    'lotesOk': {
                                        $reduce: {
                                            input: '$$item.historyDisp',
                                            initialValue: true,
                                            in: { $and: ['$$value', { $ne: ['$$this.loteVenta', ''] }] } // Verifica si todos los elementos de historyDisp.loteVenta están presentes
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            { sellerName: 1 }, { client: 1 }, { delivery: 1 }, { notes: 1 }, { state: 1 },
            { createdAt: 1 }, { totalReq: 1 }, { TotalDisp: 1 }
        ]
        query.otrosMatch = [{ _id: new ObjectId(data.idDocument) }, { 'orderItem._id': new ObjectId(data.idItem) }];
        const resultado = await contenido(query);
        res.status(200).json({ success: true, message: 'Operación completada con éxito', data: resultado });
    } catch (error) {
        next(error);
    }
}

apiCtrl.updateHistoryAverias = async (req, res, next) => {
    try {
        let response='ok';
        const data = req.body, user = req.user;
        
        const consulta = await Averia.find({ _id: new Object(data._id) }, 'state');
        if (consulta.length === 0 || consulta[0].state === 1) {
            res.json({ fail: true, message: 'No se puede editar un documento FACURADO.', data: {} });
        }
        console.log('codiguito de actualizar historia av',response);
        res.json(response);
    } catch (error) {
        next(error);
    }
}

apiCtrl.updateHistoryDisp = async (req, res, next) => {
    try {
        let response;
        const data = req.body, user = req.user;
        const obj = [...data.obj];
        const consulta = await Order.find({ _id: new Object(data._id) }, 'state');
        if (consulta.length === 0 || consulta[0].state === 1) {
            res.json({ fail: true, message: 'No se puede editar un documento FACURADO.', data: {} });
        }

        for (let i = 0; i < obj.length; i++) {
            const newDsp = await Order.aggregate([
                {
                    '$match': {
                        '_id': new ObjectId(data._id)
                    }
                }, {
                    '$unwind': {
                        'path': '$orderItem'
                    }
                }, {
                    '$match': {
                        'orderItem._id': new ObjectId(data.idItem)
                    }
                }, {
                    '$unwind': {
                        'path': '$orderItem.historyDisp'
                    }
                }, {
                    '$match': {
                        'orderItem.historyDisp._id': new ObjectId(obj[i]._id)
                    }
                }, {
                    '$project': {
                        'dispatcher': '$orderItem.historyDisp.dspHistory',
                        '_id': 0
                    }
                }
            ]);
            const actDsp = `${newDsp[0].dispatcher}-${user.alias}`;
            const fechaActual = new Date();
            await Order.findOneAndUpdate(
                { _id: data._id },
                {
                    $inc: {
                        'TotalDisp': obj[i].adjust,
                        'orderItem.$[outer].dispatch': obj[i].adjust,
                        'orderItem.$[outer].historyDisp.$[inner].qtyHistory': obj[i].adjust
                    },
                    $set: {
                        'orderItem.$[outer].historyDisp.$[inner].dspHistory': actDsp,
                        'orderItem.$[outer].historyDisp.$[inner].fechaHistory': fechaActual,
                        'orderItem.$[outer].historyDisp.$[inner].loteVenta': obj[i].loteVenta
                    }
                },
                {
                    arrayFilters: [
                        { 'outer._id': data.idItem },
                        { 'inner._id': obj[i]._id }
                    ]
                }
            );
        }

        const query = {};
        query.modelo = 'Order';
        query.sortObject = {};
        query.proyectar = [
            {
                'orderItem': {
                    $map: {
                        input: '$orderItem',
                        as: 'item',
                        in: {
                            $mergeObjects: [
                                '$$item',
                                {
                                    'lotesOk': {
                                        $reduce: {
                                            input: '$$item.historyDisp',
                                            initialValue: true,
                                            in: { $and: ['$$value', { $ne: ['$$this.loteVenta', ''] }] } // Verifica si todos los elementos de historyDisp.loteVenta están presentes
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            { sellerName: 1 }, { client: 1 }, { delivery: 1 }, { notes: 1 }, { state: 1 },
            { createdAt: 1 }, { totalReq: 1 }, { TotalDisp: 1 }
        ]
        query.otrosMatch = [{ _id: new ObjectId(data._id) }, { 'orderItem._id': new ObjectId(data.idItem) }];
        response = await contenido(query);
        res.json(response);
    } catch (error) {
        next(error);
    }
}

module.exports = apiCtrl;