const { 
    contenido,
    keys
} = require('../utilities/corefunctions');
const coreCtrl = {};
const mongoose = require('mongoose');
const Editable = require('../models/Editable');
const Order = require('../models/Order');
const Errorl = require('../models/Errorl');
const User = require('../models/User');
const passport = require('passport');
//const  = require('../services/serv.db');

const config = require('../config/settings'); // Importa el archivo config.js

const maxProductos = config.maxProductos;
const maxUsuarios = config.maxUsuarios;

/*console.log('Cantidad máxima de productos:', maxProductos);
console.log('Cantidad máxima de usuarios:', maxUsuarios);*/



coreCtrl.editContent = async (req, res, next) => {
    try {
        const data = req.body;
        //console.log(data);
        //data.funcion = 'count';
        
        const result = await contenido(data);
        res.json(result);


    } catch (error){
        next(error);
    }
}

coreCtrl.deleteDocument  = async(req, res, next) => {
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

coreCtrl.genCount = async (req, res, next) => {
    try {
        const data = req.body;
        //console.log(data);
        data.funcion = 'count';
        
        const result = await contenido(data);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

coreCtrl.getKeys = async (req, res, next) => {
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

coreCtrl.listCollections  = async(req, res, next) => {
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

coreCtrl.logout = async (req, res, next) => {
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



coreCtrl.renderEditor = async (req, res, next) => {
    const panel = {
        "boton-xls":true,
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

coreCtrl.saveDocument = async (req, res, next) => {
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

coreCtrl.userAuth = passport.authenticate('local',{
   
    failureRedirect:'/signin',
    successRedirect:'/intercambiador',
    failureFlash: true,  

});



//******** borrar: */
coreCtrl.test = async(req, res, next) =>{
    try {    
        
        res.status(200).json({ message: 'Operación exitosa core!!',
        'Cantidad máxima de productos:': maxProductos,
        'Cantidad máxima de usuarios:': maxUsuarios

     });
    } catch (error) {
        next(error);
    }
}


module.exports = coreCtrl;