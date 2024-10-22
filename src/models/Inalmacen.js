const {Schema, model} = require('mongoose');
const localSchema = new Schema({
    
    agotado:{
        type: 'Boolean',
        alias: 'Lote agotado',
        default: false
    },
    cantidad: {
        type: 'Number',
        alias: 'Cantidad'
    },
    facturada:{
        type: 'Boolean',
        alias: 'Facturada',
        default: false
    },
    insumo:{
        codigo:{
            type: 'String',
            alias: 'Codigo'
        },
        nombre:{
            type: 'String',
            alias: 'Insumo'
        },
        unidad:{
            type: 'String',
            alias: 'Unidad'
        }
    },
    lote:{
        type: 'String',
        required: true,
        unique: true,
        alias: 'Lote'
    },
    nit:{
        type: 'String',
        alias: 'NIT'
    },
    nombreProveedor:{
        type: 'string',
        alias: 'Proveedor'
    },
    operario:{
        type: 'string',
        alias: 'Funcionario'
    },
    
    vence:{
        type: 'Date',
        required: true,
        alias: 'Vence'
    },
    fechaw:{
        type: 'Date',
        required: true,
        alias: 'Fecha Op.'
    },
    acepta:{
        type: 'String',
        alias: 'Acepta'
    },
    rechaza:{
        type: 'String',
        alias: 'Rechaza'
    }
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Inalmacen', localSchema);