const {Schema, model} = require('mongoose');
const InsumoSchema = new Schema({
    codigo:{
        type: 'string',
        required: true,
        alias: 'Codigo'
    },
    nombre:{
        type: 'string',
        required: true,
        alias: 'Insumo'
    },
    unidad:{
        type: 'string',
        required: true,
        alias: 'Unidad'
    },
    categoria:{
        type: 'string',
        required: true,
        alias: 'Categoria'
    },
    diasVence:{
        type: 'number',
        default: 0,
        alias: 'dias auto vence'
    },
    trazable:{
        type: 'boolean',
        default: true,
        alias: 'Trazable'
    }
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Insumo', InsumoSchema);