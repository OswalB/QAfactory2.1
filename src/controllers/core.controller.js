const {
    contenido,
    keys, setNewPass,
    guardarSubdocumento, borrarSubdocumento
} = require('../utilities/corefunctions');
const coreCtrl = {};
const mongoose = require('mongoose');
//const Averia = require('../models/Averia');
const Client = require('../models/Client');
const Criterio = require('../models/Criterio');
const Editable = require('../models/Editable');
const Errorl = require('../models/Errorl');
const Formula = require('../models/Formula');
const Inalmacen = require('../models/Inalmacen');
const Insumo = require('../models/Insumo');
const ObjectId = require('mongodb').ObjectId;
const Order = require('../models/Order');
const passport = require('passport');
const Planilla = require('../models/Planilla');
const Serial = require('../models/Serial');
const Store = require('../models/Store');
const User = require('../models/User');

//const  = require('../services/serv.db');

const config = require('../config/settings'); // Importa el archivo config.js

const maxProductos = config.maxProductos;
const maxUsuarios = config.maxUsuarios;

/*console.log('Cantidad máxima de productos:', maxProductos);
console.log('Cantidad máxima de usuarios:', maxUsuarios);*/

coreCtrl.x = async (req, res, next) => {
    try {
        const data = req.body;

        res.json(response);
    } catch (error) {
        next(error);
    }
}

coreCtrl.changepass = async (req, res, next) => {
    try {
        const errors = [];
        const { password, confirm_password } = req.body;
        const _id = req.user._id

        if (password != confirm_password) {
            errors.push({ text: 'Password no coincide.' });

        };
        if (password.length < 4) {
            errors.push({ text: 'Password debe tener al menos 4 caracteres' });
        };
        if (errors.length > 0) {
            res.render('index/changepass', { errors });
        } else {
            setNewPass(_id, password);
            req.flash('success_msg', 'Passwor cambiado exitosamente.');
            res.redirect('/intercambiador');
        }


    } catch (error) {
        next(error);
    }
}

coreCtrl.editContent = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await contenido(data);
        res.json(result);

    } catch (error) {
        next(error);
    }
}



coreCtrl.embodegar = async (req, res, next) => {
    try {
        const { documentos } = req.body;
        const operario = req.user.alias;
        for (const documento of documentos) {
            documento.operario = operario;
            try {
                const newDocument = await Store.create(documento);
            } catch (error) {
                throw error; // Pasar al manejador de errores

            }
        }

        res.json({ success: true, message: 'Embodegamiento guardado.' });

    } catch (error) {
        next(error);
    }
};

coreCtrl.deleteDocument = async (req, res, next) => {
    try {
        const { modelo, _id, _ids } = req.body;
        const schema = require(`../models/${modelo}`);

        let resp;

        if (_id) {
            // Si se proporciona un solo _id, elimina un solo documento
            resp = await schema.deleteOne({ _id });
        } else if (_ids && Array.isArray(_ids)) {
            // Si se proporciona un array de _ids, elimina varios documentos
            resp = await schema.deleteMany({ _id: { $in: _ids } });
        } else {
            return res.json({ fail: true, message: 'No se proporcionaron _id o _ids válidos.' });
        }

        if (resp.deletedCount > 0) {
            res.json({ success: true, message: 'Documento(s) eliminado(s) exitosamente.' });
        } else {
            res.json({ fail: true, message: 'No se encontraron documentos para eliminar.' });
        }
    } catch (error) {
        next(error);
    }
}

coreCtrl.deleteSubPlanilla = async (req, res, next) => {
    try {
        const data = req.body;
        data.modelo = 'Planilla';
        data.subdocumentoPath = 'detalle';
        let response;
        response = await borrarSubdocumento(data);
        console.log(response);
        res.json(response);
    } catch (error) {
        next(error);
    }
}

coreCtrl.getCriterios = async (req, res, next) => {
    try {
        pipeline = [
            {
                '$sort': {
                    'codigo': 1,
                    'nombre': 1
                }
            }
        ]
        const result = await Criterio.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

coreCtrl.getInsumos = async (req, res, next) => {
    try {
        let response;
        let pipeline = [
            {
                '$sort': {
                    'categoria': 1,
                    'nombre': 1
                }
            }, {
                '$project': {
                    '_id': 0,
                    'categoria': 0,
                    'createdAt': 0,
                    'updatedAt': 0,
                    'perfijoLote': 0
                }
            }
        ];
        response = await Insumo.aggregate(pipeline);
        pipeline = [
            {
                '$addFields': {
                    'codigo': '$codigoProd',
                    'unidad': 'gramos'
                }
            }, {
                '$project': {
                    'codigo': 1,
                    'nombre': 1,
                    'unidad': 1,
                    '_id': 0
                }
            }
        ];
        let masas = await Formula.aggregate(pipeline);
        response = [...response, ...masas];
        res.json(response);

    } catch (error) {
        next(error);
    }
}

coreCtrl.getKeys = async (req, res, next) => {
    try {

        const { modelo } = req.body;
        if (!modelo) {
            return res.json([{ "fail": true }]);
        }

        const eschema = require(`../models/${modelo}`);
        const listk = eschema.schema.obj;
        const listaCampos = Object.keys(listk).filter(key => {
            return key !== '_id' && key !== '__v' && key !== 'password' && key !== 'updatedAt' && listk[key].type;
        }).map(key => {
            const alias = listk[key].alias || '';
            const tipo = listk[key].type.toLowerCase();
            return {
                "campo": key,
                "alias": alias,
                "tipo": tipo,
                "default": listk[key].default,
                "require": listk[key].require,
                "max": listk[key].max,
                "min": listk[key].min,
                "maxlength": listk[key].maxlength,
                "minlength": listk[key].minlength,
                "enum": listk[key].enum,
                "match": listk[key].match,
                "failMsg": listk[key].failMsg

            };
        }).sort((a, b) => (a.alias > b.alias) ? 1 : -1);

        res.json(listaCampos);


    } catch (error) {
        next(error);
    }
}

coreCtrl.getPool = async (req, res, next) => {
    try {
        const lote = req.params.id;
        //const lote = req.body.lote
        //console.log(req.body  )
        let pipeline = [
            {
                '$match': { lote: lote }
            }, {
                '$project': {
                    'lote': 1,
                }
            }, {
                '$addFields': {
                    'copyPool': []
                }
            }
        ];

        let aggRes = await Inalmacen.aggregate(pipeline);
        console.log(aggRes)
        if (aggRes.length > 0) {
            res.json(aggRes);
        } else {

            pipeline = [
                {
                    '$match': { loteOut: lote }
                },
                {
                    '$project': {
                        lote:'$loteOut',
                        'lotesPool': 1,
                        detalle:1
                    }
                },
                {
                    '$addFields': {
                        'copyPool': {
                            '$concatArrays': [
                                '$lotesPool',
                                {
                                    '$map': {
                                        'input': '$detalle',
                                        'as': 'detalleItem',
                                        'in': '$$detalleItem.loteIn'
                                    }
                                }
                            ]
                        }
                    }
                }
            ];


            let aggRes2 = await Planilla.aggregate(pipeline);

            res.json(aggRes2);
        }
    } catch (error) {
        next(error);
    }
}

coreCtrl.getLotesparaProduccion = async (req, res, next) => {
    try {
        const codigo = req.body.codigo
        //console.log(req.body  )
        let pipeline = [
            {
                '$match': {
                    '$and': [
                        {
                            'insumo.codigo': codigo
                        }, {
                            'agotado': false
                        }
                    ]
                }
            }, {
                '$sort': {
                    'vence': 1
                }
            }, {
                '$project': {
                    'lote': 1,
                    'vence': 1,
                    'nombreProveedor': 1,
                    'fechaw': 1
                }
            }, {
                '$addFields': {
                    'compuesto': false,
                    'copyPool': []
                }
            }
        ];

        let aggRes = await Inalmacen.aggregate(pipeline);

        pipeline = [
            {
                '$match': {
                    'formulaOk': true,
                    'codigoProducto': codigo,
                    'agotado': false
                }
            },
            {
                '$project': {
                    'lote': '$loteOut',
                    'vence': 1,
                    'nombreProveedor': { '$ifNull': ['$nombreProveedor', 'Prod. propio'] },
                    'fechaw': '$fecha1',
                    'lotesPool': 1,  // Incluye lotesPool para usar en copyPool
                    'detalle': 1      // Incluye detalle para extraer loteIn
                }
            },
            {
                '$sort': {
                    'vence': 1
                }
            },
            {
                '$addFields': {
                    'compuesto': true,
                    'copyPool': {
                        '$concatArrays': [
                            '$lotesPool',
                            {
                                '$map': {
                                    'input': '$detalle',
                                    'as': 'detalleItem',
                                    'in': '$$detalleItem.loteIn'
                                }
                            }
                        ]
                    }
                }
            }
        ];

        aggRes = aggRes.map(obj => ({ ...obj, org: 'Inalmacen' }));
        let aggRes2 = await Planilla.aggregate(pipeline);
        aggRes2 = aggRes2.map(obj => ({ ...obj, org: 'Planilla' }));
        let resMerge = [...aggRes, ...aggRes2];

        res.json(resMerge);

    } catch (error) {
        next(error);
    }
}

coreCtrl.getLotesVigentes = async (req, res, next) => {
    try {
        const { code } = req.body;
        let fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);

        let limiteVence = new Date();
        let fechaHoy = new Date();
        limiteVence.setDate(fechaHoy.getDate() - 6);
        let pipeline = [
            {
                $match: {
                    codigoProducto: code,
                    vence: { $gte: fechaLimite }
                }
            },
            {
                $addFields: {
                    vencido: {
                        $cond: {
                            if: { $lte: ["$vence", limiteVence] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $sort: {
                    vence: 1 // Orden ascendente por loteOut
                }
            },
            {
                $project: {
                    _id: 0, // Excluir el campo _id
                    vencido: 1,
                    vence: 1,
                    loteOut: 1
                }
            }
        ];

        response = await Planilla.aggregate(pipeline);


        res.json(response);

    } catch (error) {
        next(error);
    }
}

coreCtrl.getNewLote = async (req, res, next) => {
    try {
        let incremento = req.body.incremento, strSerie = req.body.strSerie;
        let loteAlmacen, lotePlanilla, duplicados, lastId = {}, sufijo = '-';
        if (strSerie == null) strSerie = '';
        strSerie = strSerie.replace(/\s+/g, '');     //elimina todos los espacios
        strSerie = strSerie.toUpperCase();
        lastId = await Serial.findOne();

        loteAlmacen = await Inalmacen.findOne({ "lote": strSerie }, { "_id": 1 });
        lotePlanilla = await Planilla.findOne({ "loteOut": strSerie }, { "_id": 1 });
        duplicados = loteAlmacen || lotePlanilla || strSerie.length < 2;
        if (strSerie.length < 1) sufijo = '';
        if (duplicados) {
            strSerie = `${lastId.consecutivo}${sufijo}${strSerie}`;
            const newSerial = (lastId.consecutivo || 0) + incremento;
            await Serial.updateOne({ "_id": lastId._id }, { $set: { 'consecutivo': newSerial } });
        }
        res.json({ 'fail': false, 'serial': strSerie });

    } catch (error) {
        next(error);
    }
}

coreCtrl.getOpers = async (req, res, next) => {
    try {
        const pipeline = [
            {
                '$match': {
                    'operario': true
                }
            }, {
                '$project': {
                    '_id': 0,
                    'name': 1,
                    'pin': 1
                }
            }
        ];

        const result = await User.aggregate(pipeline);
        res.json(result);

    } catch (error) {
        next(error);
    }
}

coreCtrl.intercambiador = async (req, res, next) => {
    try {
        const { administrador, vendedor, password, operario, despachador } = req.user;
        const obsoletePass = await req.user.matchPassword('3210');
        if (obsoletePass) {
            res.redirect('/change-pass');
            return
        }
        if (administrador || despachador) {
            res.redirect('/domain/despachos');
            return
        }
        if (vendedor) {
            res.redirect('/domain/pedidos');
            return
        }
        if (operario) {
            res.redirect('/domain/planillas');
            return
        }
    } catch (error) {
        next(error);
    }
}

coreCtrl.listCollections = async (req, res, next) => {
    try {
        const pipeline = [
            {
                '$sort': {
                    'titulo': 1
                }
            }, {
                '$project': {
                    'titulo': 1,
                    'modelo': 1,
                    '_id': 0
                }
            }
        ];
        const aggRes = await Editable.aggregate(pipeline);
        res.json(aggRes);
    } catch (error) {
        next(error);
    }
}

coreCtrl.lotesManager = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data.codigo) {
            res.json([{ countTotal: 0 }]);
            return
        }
        data.modelo = 'Inalmacen';
        data.otrosMatch.push({ 'insumo.codigo': data.codigo });
        data.proyectar.push(
            {
                agotado: 1, lote: 1, loteOut: 1,
                fechaw: 1, fecha1: 1,
                cantidad: 1, cantProd: 1,
                operario: 1, nombreProveedor: 1
            }
        )
        response = await contenido(data);
        response = response.map(obj => ({ ...obj, org: data.modelo }));
        response = response.map(obj => {
            const { nombreProveedor, ...rest } = obj;
            return {
                tercero: nombreProveedor,
                ...rest
            };
        });
        if (response[0].countTotal < 1) {
            data.modelo = 'Planilla';
            data.otrosMatch = [{ codigoProducto: data.codigo }];
            response = await contenido(data);
            response = response.map(obj => ({ ...obj, org: data.modelo }));
            response = response.map(obj => {
                const { loteOut, fecha1, cantProd, operario, ...rest } = obj;
                return {
                    lote: loteOut,
                    fechaw: fecha1,
                    cantidad: cantProd,
                    tercero: operario,
                    ...rest
                };
            });
        }
        res.json(response);


    } catch (error) {
        next(error);
    }
}

coreCtrl.logout = async (req, res, next) => {
    try {
        req.logout(function (err) {
            if (err) { return; }
            res.redirect('/');
        });
        req.flash('success_msg', 'Ha cerrado su sesión.');
        res.redirect('/signin');

    } catch (error) {
        next(error);
    }
};

coreCtrl.operarios = async (req, res, next) => {
    try {
        const pipeline = [
            {
                '$match': {
                    'operario': true
                }
            }, {
                '$project': {
                    '_id': 0,
                    'name': 1,
                    'pin': 1
                }
            }
        ];

        const result = await User.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

coreCtrl.procesosList = async (req, res, next) => {
    try {
        let pipeline = [
            {
                '$match': {
                    'siFormulaOk': true
                }
            }, {
                '$sort': {
                    'categoria': 1,
                    'nombre': 1
                }
            }, {
                '$unwind': {
                    'path': '$detalle'
                }
            }, {
                '$match': {
                    'detalle.siBase': true
                }
            }, {
                '$project': {
                    '_id': 0,
                    'proceso': '$nombre',
                    'codigoProceso': '$codigoProd',
                    'insumo': '$detalle.nombreInsumo',
                    'codigoInsumo': '$detalle.codigoInsumo',
                    'cantidad': '$detalle.cantidad',
                    'unidad': '$detalle.unidad',
                    'categoria': 1,
                    'diasVence': 1,
                    prodMax: 1,
                    prodMin: 1
                }
            }
        ];

        let lista = await Formula.aggregate(pipeline);
        res.json(lista);
    } catch (error) {
        next(error);
    }
}

coreCtrl.proveedoresList = async (req, res, next) => {
    try {
        const pipeline = [
            {
                '$match': {
                    'siProvider': true
                }
            }, {
                '$sort': {
                    'nombre': 1
                }
            }, {
                '$project': {
                    'nombre': 1,
                    'idClient': 1,
                    '_id': 0
                }
            }];
        const aggRes = await Client.aggregate(pipeline);
        res.json(aggRes);
    } catch (error) {
        next(error);
    }
}

coreCtrl.renderChangepass = async (req, res, next) => {
    const panel = { "boton-ingresar": true };

    try {
        res.render('index/changepass', { panel });
    } catch (error) {
        next(error);
    }
};

coreCtrl.renderEditor = async (req, res, next) => {
    const panel = {
        "boton-xls": true,
        "boton-pagination": true,
        "boton-opciones": true,
        "titulo": "Editor de documentos"
    };

    try {
        res.render('index/editor', { panel });
    } catch (error) {
        next(error);
    }
};

coreCtrl.renderIndex = async (req, res, next) => {
    try {
        res.render('index/index')
    } catch (error) {
        next(error);
    }
};

coreCtrl.renderSignin = async (req, res, next) => {
    try {
        res.render('users/signin')
    } catch (error) {
        next(error);
    }
};

coreCtrl.resetPass = async (req, res, next) => {
    try {
        const { _id } = req.body;
        await setNewPass(_id, '3210');
        res.json("Nuevo password : 3210");
    } catch (error) {
        next(error);
    }
};

coreCtrl.saveDocument = async (req, res, next) => {
    try {
        console.log(req.body)
        const { modelo, documentos } = req.body;
        if (!modelo || !documentos || !Array.isArray(documentos)) {
            return res.json({ fail: true, message: 'Se requiere el modelo y un array de documentos.' });
        }

        const dynamicModel = mongoose.model(modelo);
        const savedDocuments = [];

        for (const documento of documentos) {
            try {
                if (documento._id) {
                    // Si el documento tiene un _id, actualiza el documento existente
                    const updatedDocument = await dynamicModel.findByIdAndUpdate(
                        documento._id,
                        documento,
                        { new: true }
                    );
                    savedDocuments.push(updatedDocument);
                } else {
                    // Si el documento no tiene _id, crea un nuevo registro
                    const newDocument = await dynamicModel.create(documento);
                    savedDocuments.push(newDocument);
                }
            } catch (error) {
                if (error.code === 11000) {
                    // Error de clave duplicada
                    return res.json({ fail: true, message: 'Error de clave duplicada.' });
                } else {
                    // Otro tipo de error
                    throw error; // Pasar al manejador de errores
                }
            }
        }

        res.json({ success: true, message: 'Documentos guardados.', data: savedDocuments });

    } catch (error) {
        next(error);
    }
};

coreCtrl.updateDoc = async (req, res, next) => {
    try {
        //data = {modelo:, _id:, params:{}, docResponse:true}
        const data = req.body;
        const dynamicModel = mongoose.models[data.modelo];
        let response;
        //console.log(data);
        const updateFields = Object.fromEntries(
            Object.entries(data.params).filter(([_, v]) => v !== undefined)
        );
        if (data.docResponse) {
            response = await dynamicModel.findByIdAndUpdate(data._id, updateFields, { new: true })
        } else {
            response = await dynamicModel.updateOne(
                { "_id": new ObjectId(data._id) },
                { $set: updateFields }
            );
        }


        res.json(response);
    } catch (error) {
        next(error);
    }
};

coreCtrl.updateSubPlanilla = async (req, res, next) => {
    try {
        //data = {modelo:, _id:, params:{}, docResponse:true}
        const data = req.body;
        data.modelo = 'Planilla';
        data.subdocumentoPath = 'detalle';
        let response;
        response = await guardarSubdocumento(data);
        res.json(response);
    } catch (error) {
        next(error);
    }
};

coreCtrl.userAuth = passport.authenticate('local', {

    failureRedirect: '/signin',
    successRedirect: '/intercambiador',
    failureFlash: true,

});



//******** borrar: */
coreCtrl.test = async (req, res, next) => {
    try {

        res.status(200).json({
            message: 'Operación exitosa core!!',
            'Cantidad máxima de productos:': maxProductos,
            'Cantidad máxima de usuarios:': maxUsuarios

        });
    } catch (error) {
        next(error);
    }
}


module.exports = coreCtrl;