const {Schema, model}= require('mongoose');
const StoreSchema = new Schema({
    codigo:{
        type: 'string',
        alias: 'Codigo'
    },
    operario:{
        type: 'string',
        alias: 'Operario'
    },
    producto:{
        type: 'string',
        alias: 'Producto'
    },
    Cantidad:{
        type: 'Number',
        alias:'Cantidad'
    }
},{
    timestamps: true,
    versionKey: false 
})

module.exports = model('Store',StoreSchema);