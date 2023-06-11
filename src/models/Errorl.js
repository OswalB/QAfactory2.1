const {Schema, model}= require('mongoose');
const ErrorSchema = new Schema({
    errorTxt:{
        type: 'string',
        alias: 'Error'
        
    },
    user:{
        type: 'string',
        alias: 'Usuario'
    },
    modulo:{
        type: 'string',
        alias: 'Modulo'
    },
    body:{
        type: 'string',
        alias: 'Data'
    },
    fechaHora:{
        type: 'string',
        alias: 'Fecha'
    }    

},{
    versionKey: false
})

module.exports = model('Errorl',ErrorSchema);