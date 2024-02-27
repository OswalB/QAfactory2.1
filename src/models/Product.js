const {Schema, model}= require('mongoose');
const ProductSchema = new Schema({
    codigo:{
        type: 'string',
        required: true,
        alias: 'Codigo'
    },
    nombre:{
        type: 'string',
        required: true,
        alias: 'Producto'
    },
    corto:{
        type: 'string',
        required: true,
        alias: 'N. corto'
    },
    categoria:{
        type: 'string',
        required: true,
        alias: 'Categoria'
    },
    precio:{
        type: 'number',
        alias: 'Precio publico'
        
    }

},{
    timestamps: true,
    versionKey: false 
});



module.exports = model('Product',ProductSchema);
