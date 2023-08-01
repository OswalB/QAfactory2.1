const apiCtrl = {};
const mongoose = require('mongoose');
const Editable = require('../models/Editable');
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


apiCtrl.content = async (req, res, next) => {
    try {
        const data = req.body;
        //const filterByType = typeof data.filterBy;
        const dynamicModel  = mongoose.models[data.modelo];
        const matchQuery = {};
        const pipeline = [];
        const proyeccion = {};
        
        if(data.filterBy && data.filterTxt && data.filterTxt.trim() !== '') {
           matchQuery[data.filterBy] = { $regex: data.filterTxt, $options: 'i' };
        }
        // Verifica si el campo seleccionado y su contenido están presentes en el body y no están en blanco
        if (data.filterBy && data.valorBoolean !== "") {
            matchQuery[data.filterBy] = data.valorBoolean;
          }
        // Verifica si se proporcionaron valores numéricos min y max y agrega las condiciones al objeto matchQuery
        if (data.filterBy && (esNumero(data.min)  || esNumero(data.max))) {
            if(esNumero(data.min)  && esNumero(data.max)){
                matchQuery[data.filterBy] =  { $gte: data.min, $lte: data.max };
            }else{
                if(esNumero(data.min)){
                    matchQuery[data.filterBy] =  { $gte: data.min };
                }else{
                    matchQuery[data.filterBy] =  { $lte: data.max };
                }
           }
            
        }
        // Verifica si se proporcionó un valor booleano y lo agrega al objeto matchQuery
        if (Object.keys(matchQuery).length > 0) {
            pipeline.push({ $match: matchQuery });
        }
        
        // Verifica si hay otras combinaciones personalizadas en 'otrosMatch'.
        if (Array.isArray(data.otrosMatch)) {
            data.otrosMatch.forEach((otherMatch) => {
                if (otherMatch && typeof otherMatch === 'object') {
                    Object.entries(otherMatch).forEach(([campo, valor]) => {
                        matchQuery[campo] = valor;
                    });
                }
            });

        }

        let funcionok = false;
        if(data.funcion === 'count'){
            funcionok = true;
            pipeline.push({ $count: 'countTotal' });
        }
        if(data.funcion === 'content'){
            funcionok = true;
            
            if(data.sortBy != '') {
                if(data.sortOrder === -1){
                    pipeline.push({'$sort': {[data.sortBy]: -1}});
                } else {
                    pipeline.push({'$sort': {[data.sortBy]: 1}});
                }
            }
            if(esNumero(data.saltar)){
                pipeline.push({'$skip': data.saltar});
            }else{
                pipeline.push({'$skip': 1});
            }
            if(esNumero(data.limitar)){
                pipeline.push({'$limit': data.limitar});
            }else{
                pipeline.push({'$limit': 1});
            }
            if (Array.isArray(data.proyectar)) {
                data.proyectar.forEach((stage) => {
                    if (stage && typeof stage === 'object') {
                        Object.entries(stage).forEach(([campo, valor]) => {
                            proyeccion[campo] = valor;
                        });
                    }
                });
            }
            if (Object.keys(proyeccion).length > 0) {
                pipeline.push({ $project: proyeccion });
            }
            
        }
    /*
    pipeline.push({'$limit': limitar});
    pipeline.push({'$project': {'__v': 0}});
        }
      */  
        if(!funcionok){
            res.json({'fail':true});
            return
        }

        for(cnt in pipeline){
           console.log(pipeline[cnt]) 
        }
        
        let result = await dynamicModel.aggregate(pipeline);    
        res.json(result)
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