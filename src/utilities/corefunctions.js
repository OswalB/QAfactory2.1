const mongoose = require('mongoose');
const Order = require('../models/Order');
const Errorl = require('../models/Errorl');
const User = require('../models/User');
const Client = require('../models/Client');
const Reason = require('../models/Reason');
const Averia = require('../models/Averia');
const Serial = require('../models/Serial');

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
        const rminDate = new Date(data.datemin);
        rangeQuery['$gte'] = rminDate;
        const rmaxDate = new Date(data.datemax);
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

    if(Object.keys(data.sortObject).length > 0){

        pipeline.push({ $sort: data.sortObject});
    }
    

    if (data.saltar) {
        const skipValue = esNumero(data.saltar) ? data.saltar : 1;
        pipeline.push({ $skip: skipValue });
    }
    if (data.limitar) {
        const limitValue = esNumero(parseInt(data.limitar)) ? parseInt(data.limitar) : 1;
        pipeline.push({ $limit: limitValue });
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
   

    for (const cnt in pipeline) {
        console.log(pipeline[cnt]);
    }

    let result = await dynamicModel.aggregate(pipeline);
    
    result.unshift(counter);
   
    return result
}

async function guardar(data){
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
                return res.json({ fail: true, message: 'Error de clave duplicada.' });
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
        return key !== '_id' && key !== '__v' && key !== 'password' && key !== 'updatedAt'  && listk[key].type;
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
    return listaCampos;

}

async function setNewPass(iduser, newPass){
    const {ObjectId} = require('mongodb');
    if(iduser){
          iduser= new ObjectId(iduser);
          usuario = await User.findOne({_id : iduser});
      const password = await usuario.encryptPassword(newPass);
      await User.updateOne({_id : iduser},{password : password});
      }
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
    borrarSubdocumento
 };