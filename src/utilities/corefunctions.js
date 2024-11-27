const mongoose = require('mongoose');
const Order = require('../models/Order');
const Errorl = require('../models/Errorl');
const User = require('../models/User');
const Client = require('../models/Client');
const Reason = require('../models/Reason');
const Averia = require('../models/Averia');
const Serial = require('../models/Serial');
const Inalmacen = require('../models/Inalmacen');
const Planilla = require('../models/Planilla');

async function contenido(data) {
    if (!data.modelo) {
        return ([{ 'countTotal': 0 }]);

    }

    const dynamicModel = mongoose.models[data.modelo];
    const pipeline = [];
    const proyeccion = {};

    if (data.keyGroup) {
        'si tiene un rango de fecha para arupar en pagina'
        const rangeQuery = {};
        //const rminDate = new Date(data.datemin);
        const rminDate = new Date(`${data.datemin}T00:00:00-05:00`);
        rangeQuery['$gte'] = rminDate;
        //const rmaxDate = new Date(data.datemax);
        const rmaxDate = new Date(`${data.datemax}T00:00:00-05:00`);
        rmaxDate.setDate(rmaxDate.getDate() + 1);
        rangeQuery['$lt'] = rmaxDate;
        pipeline.push({ $match: { [data.keyGroup]: rangeQuery } });
    }

    if (data.filterBy && data.filterTxt && data.filterTxt.trim() !== '') {
        pipeline.push({ $match: { [data.filterBy]: { $regex: data.filterTxt, $options: 'i' } } });
    }

    if (data.filterBy && data.valorBoolean !== "") {
        pipeline.push({ $match: { [data.filterBy]: data.valorBoolean === 'true' } });
    }

    if (data.filterBy && (esNumero(data.min) || esNumero(data.max))) {
        const numericQuery = {};
        if (esNumero(data.min)) numericQuery['$gte'] = data.min;
        if (esNumero(data.max)) numericQuery['$lte'] = data.max;
        pipeline.push({ $match: { [data.filterBy]: numericQuery } });
    }
    if ((data.filterBy && !data.keyGroup) && (esFecha(data.datemin) || esFecha(data.datemax))) {
        const dateQuery = {};
        if (esFecha(data.datemin)) {
            const minDate = new Date(data.datemin);
            dateQuery['$gte'] = minDate;
        }

        if (esFecha(data.datemax)) {
            const maxDate = new Date(data.datemax);
            maxDate.setDate(maxDate.getDate() + 1);
            dateQuery['$lt'] = maxDate;
        }
        pipeline.push({ $match: { [data.filterBy]: dateQuery } });
    }

    if (Array.isArray(data.otrosMatch)) {
        data.otrosMatch.forEach((otherMatch) => {
            if (otherMatch && typeof otherMatch === 'object') {
                pipeline.push({ $match: otherMatch });
            }
        });
    }

    const pipecount = pipeline.slice();
    pipecount.push({ $count: 'countTotal' });

    let counter = await dynamicModel.aggregate(pipecount);
    if (counter.length < 1) counter = [{ countTotal: 0 }];
    counter = counter[0];

    if (Object.keys(data.sortObject).length > 0) {

        pipeline.push({ $sort: data.sortObject });
    }


    if (data.saltar) {
        const skipValue = esNumero(data.saltar) ? data.saltar : 1;
        pipeline.push({ $skip: skipValue });
    }
    if (data.limitar) {
        const limitValue = esNumero(parseInt(data.limitar)) ? parseInt(data.limitar) : 1;
        pipeline.push({ $limit: limitValue });
    }

    if (data.look){
        pipeline.push({$lookup:data.look});
        pipeline.push({$unwind:data.unwindLook});
    }

    if (Array.isArray(data.proyectar)) {
        data.proyectar.forEach((stage) => {
            if (stage && typeof stage === 'object') {
                Object.assign(proyeccion, stage);
            }
        });
    }

    if (Object.keys(proyeccion).length > 0) {
        pipeline.push({ $project: proyeccion });
    }

    
    

    let result = await dynamicModel.aggregate(pipeline);

    result.unshift(counter);

    return result
}

async function guardar(data) {
    const { modelo, documentos } = data;
    if (!modelo || !documentos || !Array.isArray(documentos)) {
        return { fail: true, message: 'Se requiere el modelo y un array de documentos.' };
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
                return ({ fail: true, message: 'Error de clave duplicada.' });
            } else {
                // Otro tipo de error
                throw error; // Pasar al manejador de errores
            }
        }
    }

    return { success: true, message: 'Documentos guardados.', data: savedDocuments };

}

async function borrarSubdocumento(data) {
    const { modelo, documentoId, subdocumentoId, subdocumentoPath } = data;

    if (!modelo || !documentoId || !subdocumentoId || !subdocumentoPath) {
        return { fail: true, message: 'Se requiere el modelo, _id del documento, _id del subdocumento y la ruta del subdocumento.' };
    }

    const dynamicModel = mongoose.model(modelo);

    try {
        const updatedDocument = await dynamicModel.findByIdAndUpdate(
            documentoId,
            { $pull: { [subdocumentoPath]: { _id: subdocumentoId } } },
            { new: true }
        );

        if (!updatedDocument) {
            return { fail: true, message: 'Documento no encontrado o subdocumento no eliminado.' };
        }
        return { success: true, message: 'Subdocumento eliminado.', data: updatedDocument };
    } catch (error) {
        throw error; // Pasar al manejador de errores
    }
}


async function guardarSubdocumento(data) {
    const { modelo, documentoId, subdocumentoId, subdocumento, subdocumentoPath } = data;

    if (!modelo || !documentoId || !subdocumento || !subdocumentoPath) {
        return { fail: true, message: 'Se requiere el modelo, _id del documento, subdocumento y la ruta del subdocumento.' };
    }

    const dynamicModel = mongoose.model(modelo);

    try {
        if (subdocumentoId) {
            // Prepara el objeto con los campos específicos para evitar eliminar otros
            const updateFields = {};
            for (const key in subdocumento) {
                updateFields[`${subdocumentoPath}.$.${key}`] = subdocumento[key];
            }

            const updatedDocument = await dynamicModel.findOneAndUpdate(
                { _id: documentoId, [`${subdocumentoPath}._id`]: subdocumentoId },
                { $set: updateFields },
                { new: true }
            );

            if (!updatedDocument) {
                return { fail: true, message: 'Subdocumento no encontrado para actualizar.' };
            }
            return { success: true, message: 'Subdocumento actualizado.', data: updatedDocument };
        } else {
            // Si no hay subdocumentoId, se crea un nuevo subdocumento
            const updatedDocument = await dynamicModel.findByIdAndUpdate(
                documentoId,
                { $push: { [subdocumentoPath]: subdocumento } },
                { new: true }
            );
            return { success: true, message: 'Subdocumento agregado.', data: updatedDocument };
        }
    } catch (error) {
        if (error.code === 11000) {
            return { fail: true, message: 'Error de clave duplicada en subdocumento.' };
        } else {
            throw error; // Pasar al manejador de errores
        }
    }
}

async function keys(data) {
    const eschema = require(`../models/${data.modelo}`);
    const listk = eschema.schema.obj;
    const listaCampos = Object.keys(listk).filter(key => {
        return key !== '_id' && key !== '__v' && key !== 'password' && key !== 'updatedAt' && listk[key].type;
    }).map(key => {
        const alias = listk[key].alias || '';
        //const tipo = listk[key].type.toLowerCase();
        const type = typeof listk[key].type === 'string' ? listk[key].type.toLowerCase() : 'unknown';
        return {
            "campo": key,
            "alias": alias,
            "tipo": type,
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
    return listaCampos;

}

async function setNewPass(iduser, newPass) {
    const { ObjectId } = require('mongodb');
    if (iduser) {
        iduser = new ObjectId(iduser);
        usuario = await User.findOne({ _id: iduser });
        const password = await usuario.encryptPassword(newPass);
        await User.updateOne({ _id: iduser }, { password: password });
    }
}

async function trazaLotesAlmacen(lotew) {
    const pipeline = [
        {
            '$match': {
                lote: { '$in': lotew }
            }
        }, {
            '$addFields': {
                enStock: { $not: ['$agotado'] },
                ninsumo: '$insumo.nombre'
            }
        }, {
            '$project': {
                _id: 0,
                ninsumo: 1, fechaw: 1, lote: 1, nombreProveedor: 1,
                operario: 1, acepta: 1, rechaza: 1, enStock: 1
            }
        }

    ]
    const result = await Inalmacen.aggregate(pipeline);
    return result
}

async function trazaLotesProduccion(lotew) {
    const pipeline = [
        {
            '$match': {
                loteOut: { '$in': lotew }
            }
        }, {
            '$addFields': {
                enStock: { $not: ['$agotado'] }
            }
        }, {
            '$project': {
                _id: 0,
                producto: 1, fecha1: 1, loteOut: 1, codigoProducto: 1,
                cantProd: 1, operario: 1, enStock: 1
            }
        }

    ];
    const result = await Planilla.aggregate(pipeline);
    return result
}

async function trazaLotesInsumosenPlanilla(lotew) {
    const pipeline = [
        {
            '$match': {
                '$or': [
                    { 'lotesPool': { '$in': lotew } },
                    { 'detalle.loteIn': { '$in': lotew } }
                ]
            }
        }, {
            '$addFields': {
                enStock: { $not: ['$agotado'] }
            }
        }, {
            '$project': {
                _id: 0,
                producto: 1, fecha1: 1, loteOut: 1, codigoProducto: 1,
                cantProd: 1, operario: 1, enStock: 1
            }
        }

    ];
    const result = await Planilla.aggregate(pipeline);
    
    return result
}

async function poolyDetalles(lotew){
    const pipeline = [
        {
            '$match': {
                'loteOut': { '$in': lotew } // Coincide con cualquiera de los lotes en el array lotew
            }
        },
        {
            '$project': {
                lotesPool: 1, // Incluye el campo lotesPool
                detalle: '$detalle.loteIn' // Extrae únicamente los lotes de detalle.loteIn
            }
        },
        {
            '$addFields': {
                mergedLotes: {
                    '$setUnion': ['$lotesPool', '$detalle'] // Combina lotesPool y detalle.loteIn en un array único
                }
            }
        },
        {
            '$project': {
                mergedLotes: 1 // Solo necesitamos el array combinado
            }
        }
    ];

    const aggres = await Planilla.aggregate(pipeline);
    const result = aggres[0].mergedLotes;
    return result
}

async function trazaLotesVenta(lotew) {
    const pipeline = [
        {
            '$match': {
                'orderItem.historyDisp': {
                    '$elemMatch': { 'loteVenta': { '$in': lotew } }
                }
            }
        },{
            '$unwind': '$orderItem'
        },{
            '$unwind': '$orderItem.historyDisp'
        },{
            '$match': {
                'orderItem.historyDisp.loteVenta': { '$in': lotew }
            }
        
        },{
            '$addFields': {
                fecha: '$delivery',
                lote:'$orderItem.historyDisp.loteVenta',
                cantidad:'$orderItem.dispatch',
                producto:'$orderItem.product'
            }
        }, {
            '$project': {
                _id: 0,
                client: 1, nit: 1, lote:1,
                producto: 1, fecha: 1, consecutivo: 1,
                cantidad: 1,
            }
        }

    ];
    const result = await Order.aggregate(pipeline);
    return result
}


esFecha = (valor) => {
    const dateObject = new Date(valor);
    return dateObject instanceof Date && !isNaN(dateObject.getTime());
}

esNumero = (valor) => {
    return typeof valor === 'number';
}

module.exports = {
    contenido, keys, guardar, setNewPass, guardarSubdocumento,
    borrarSubdocumento,
    trazaLotesAlmacen, trazaLotesProduccion, trazaLotesVenta,
    trazaLotesInsumosenPlanilla, poolyDetalles
};