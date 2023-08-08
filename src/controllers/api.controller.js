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
        return { "campo": key, "alias": alias, "tipo": tipo };
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
  
            const skipValue = esNumero(data.saltar) ? data.saltar : 1;
            pipeline.push({ $skip: skipValue });
  
            const limitValue = esNumero(parseInt(data.limitar)) ? parseInt(data.limitar) : 1;
            pipeline.push({ $limit: limitValue });
  
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
        
        const result = await dynamicModel.aggregate(pipeline);
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

apiCtrl.user_auth = passport.authenticate('local',{
   
        failureRedirect:'/signin',
        successRedirect:'/intercambiador',
        failureFlash: true,  
    
});




esNumero = (valor) => {
    return typeof valor === 'number';
}

module.exports = apiCtrl  ;