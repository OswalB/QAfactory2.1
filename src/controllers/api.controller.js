const apiCtrl = {};
const mongoose = require('mongoose');
const Editable = require('../models/Editable');
const Order = require('../models/Order');

const Errorl = require('../models/Errorl');
const User = require('../models/User');
const passport = require('passport');
//const Note = require('../models/Note');
const DvService = require('../services/serv.db');

apiCtrl.gc = async (req, res) => {
    const panel = { "titulo":"TEST","boton-nuevo":true, "boton-pagination":true};
    res.json([{'countTotal':13}])   
};

apiCtrl.test = async (req, res) => {
    const panel = { "titulo":"TEST","boton-nuevo":true, "boton-pagination":true};
    res.render('test',{panel})   
};

apiCtrl.getKeys = async (req, res, next) => {
    try{
        
        const { modelo } = req.body;
        if (!modelo) {
            return res.json([{ "fail": true }]);
        }   
        
        const eschema = require(`../models/${modelo}`);
        const listk = eschema.schema.obj;
        const listaCampos = Object.keys(listk).filter(key => {
            return key !== '_id' && key !== '__v' && key !== 'password' && key !== 'updatedAt' && key !== 'createdAt' && listk[key].type;
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





apiCtrl.content = async (req, res, next) => {
    try {
        const data = req.body;
        //console.log(data);
        if (!data.modelo) {
            res.json([{ 'countTotal': 0 }]);
            return;
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
        console.log(data)
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
            res.json({ 'fail': true });
            return;
        }
  
        for (const cnt in pipeline) {
            console.log(pipeline[cnt]);
        }
        
        let result = await dynamicModel.aggregate(pipeline);
        if(result.length < 1)  result = [{countTotal: 0}]
        res.json(result);
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

apiCtrl.listCollections  = async(req, res, next) => {
    try {
      const pipeline =[
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
    }catch (error) {
        next(error);
    }
}
  


apiCtrl.logout = async (req, res, next) => {
    try { 
        req.logout(function(err) {
            if (err) { return ; }
        res.redirect('/');
        });
        req.flash('success_msg','Ha cerrado su sesión.');
        res.redirect('/signin'); 
        
    } catch (error) {
        next(error);
    }
};

apiCtrl.renderEditor = async (req, res, next) => {
    const panel = {
        "boton-pagination":true,
        "boton-opciones":true,
        "titulo":"Editor de documentos"
    };

    try {     
        res.render('index/editor',{panel});
    } catch (error) {
        next(error);
    }
};

apiCtrl.renderIndex = async (req, res, next) => {
    try {     
        res.render('index/index')
    } catch (error) {
        next(error);
    }
};

apiCtrl.render_signin = async (req, res, next) => {
    try {     
        res.render('users/signin')
    } catch (error) {
        next(error);
    }
};

apiCtrl.deleteDocument  = async(req, res, next) => {
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

apiCtrl.saveDocument = async (req, res, next) => {
    try {
        const { modelo, documentos } = req.body;
        console.log(req.body);
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


apiCtrl.user_auth = passport.authenticate('local',{
   
        failureRedirect:'/signin',
        successRedirect:'/intercambiador',
        failureFlash: true,  
    
});


esFecha = (valor) => {
    const dateObject = new Date(valor);
    return dateObject instanceof Date && !isNaN(dateObject.getTime());
}

esNumero = (valor) => {
    return typeof valor === 'number';
}

module.exports = apiCtrl  ;