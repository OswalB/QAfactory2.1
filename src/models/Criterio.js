const {Schema, model} = require('mongoose');
const jsSchema = new Schema({
    codigo:{
        type: 'String',
        required: true,
        alias: 'Codigo'
    },
    nombre:{
        type: 'String',
        required: true,
        alias: 'Criterio'
    },
    textoa:{
        type: 'String',
        required: true,
        alias: 'Aceptar'
    },
    textor:{
        type: 'String',
        required: true,
        alias: 'Rechazar'
    }
    
},{
    versionKey: false 
});

module.exports = model('Criterio', jsSchema);

