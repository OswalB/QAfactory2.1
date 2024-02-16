const mongoose = require('mongoose');
const Order = require('../models/Order');
const Errorl = require('../models/Errorl');
const User = require('../models/User');

async function contenido(data) {
    if (!data.modelo) {
        return ([{ 'countTotal': 0 }]);
        
    }

    const dynamicModel = mongoose.models[data.modelo];
    const pipeline = [];
    const proyeccion = {};

    if (data.keyGroup) {        'si tiene un rango de fecha para arupar en pagina'
        const rangeQuery = {};
        const rminDate = new Date(data.datemin);
        rangeQuery['$gte'] = rminDate; 
        const rmaxDate = new Date(data.datemax);
        rmaxDate.setDate(rmaxDate.getDate() + 1);
        rangeQuery['$lt'] = rmaxDate; 
        pipeline.push({ $match: { [data.keyGroup]: rangeQuery}});
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
    //console.log(data)
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
        //pipeline.push({ $match: { [data.filterBy]: numericQuery } });
        pipeline.push({ $match: { [data.filterBy]: dateQuery}});
    }

    if (Array.isArray(data.otrosMatch)) {
        data.otrosMatch.forEach((otherMatch) => {
            if (otherMatch && typeof otherMatch === 'object') {
                pipeline.push({ $match: otherMatch });
            }
        });
    }

    let funcionok = false;

    if (data.funcion === 'count') {
        funcionok = true;
        pipeline.push({ $count: 'countTotal' });
    }

    if (data.funcion === 'content') {
        funcionok = true;

        if (data.sortBy !== '') {
            const sortOrder = data.sortOrder === -1 ? -1 : 1;
            pipeline.push({ $sort: { [data.sortBy]: sortOrder } });
        }
        if(data.saltar){
            const skipValue = esNumero(data.saltar) ? data.saltar : 1;
        pipeline.push({ $skip: skipValue });
        }
        if(data.limitar){
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
    }

    if (!funcionok) {
        return  ({ 'fail': true });
        
    }

    for (const cnt in pipeline) {
        console.log(pipeline[cnt]);
    }

    let result = await dynamicModel.aggregate(pipeline);
    if(result.length < 1)  result = [{countTotal: 0}]

    return result
}

esFecha = (valor) => {
    const dateObject = new Date(valor);
    return dateObject instanceof Date && !isNaN(dateObject.getTime());
}

esNumero = (valor) => {
    return typeof valor === 'number';
}

module.exports ={contenido};