const { 
    contenido,
    keys, setNewPass
} = require('../utilities/corefunctions');
const coreCtrl = {};
const mongoose = require('mongoose');
const Averia = require('../models/Averia');
const Editable = require('../models/Editable');
const Order = require('../models/Order');
const Planilla = require('../models/Planilla');
const Errorl = require('../models/Errorl');
const User = require('../models/User');
const passport = require('passport');
//const  = require('../services/serv.db');

const config = require('../config/settings'); // Importa el archivo config.js

const maxProductos = config.maxProductos;
const maxUsuarios = config.maxUsuarios;

/*console.log('Cantidad máxima de productos:', maxProductos);
console.log('Cantidad máxima de usuarios:', maxUsuarios);*/

coreCtrl.changepass = async (req, res, next) => {
    try {
        const errors = [];
        const {password,confirm_password} = req.body;
        const _id = req.user._id
        
        if(password != confirm_password) {
            errors.push({text: 'Password no coincide.'});
            
        };
        if(password.length < 4) {
            errors.push({text: 'Password debe tener al menos 4 caracteres'});
        };
        if(errors.length > 0) {
            res.render('index/changepass',{errors});
        }else{
                setNewPass(_id, password);
                req.flash('success_msg','Passwor cambiado exitosamente.');
                res.redirect('/intercambiador');
        }


    } catch (error){
        next(error);
    }
}

coreCtrl.editContent = async (req, res, next) => {
    try {
        const data = req.body;
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

coreCtrl.getLotesVigentes = async (req, res, next) => {
    try{
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

coreCtrl.intercambiador = async (req, res, next) => {
    try{
        const {administrador, vendedor, password, operario, despachador} = req.user;
        const obsoletePass =  await req.user.matchPassword('3210');
        if(obsoletePass){
            res.redirect('/change-pass');
            return
        }
        if(administrador || despachador){
            res.redirect('/domain/despachos');
            return
        }
        if(vendedor){
            res.redirect('/domain/pedidos');
            return
        }
        if(operario){
            res.redirect('/domain/planillas');
            return
        }
        }catch(error){
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

coreCtrl.renderChangepass = async (req, res, next) => {
    const panel = {"boton-ingresar":true};

    try {     
        res.render('index/changepass',{panel});
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

coreCtrl.resetPass = async (req, res, next) => {
    try {     
        const {_id} = req.body;
        await setNewPass(_id, '3210');  
        res.json("Nuevo password : 3210"); 
    } catch (error) {
        next(error);
    }
};



coreCtrl.saveDocument = async (req, res, next) => {
    try {
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