const { Schema, model } = require('mongoose');
const ClientSchema = new Schema({
    nombre: {
        type: 'string',
        required: true,
        alias: 'Nombre'
    },
    idClient: {
        type: 'string',
        required: true,
        alias: 'ID o C.C.'
    },
    idSeller: {
        type: 'string',
        required: true,
        default: 0,
        alias: 'Id vendedor'
    },
    siProvider: {
        type: 'Boolean',
        default: false,
        alias: 'Es proveedor'
    },
    addres: {
        type: 'string',
        alias: 'Dirección'
    },
    city: {
        type: 'string',
        alias:'Ciudad'
    },
    tel: {
        type: 'string',
        alias:'Teléfono'
    }

}, {
    versionKey: false
})

module.exports = model('Client', ClientSchema);