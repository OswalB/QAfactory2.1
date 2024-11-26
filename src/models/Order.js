const {Schema, model}= require('mongoose');

const OrderSchema = new Schema({
    consecutivo:{
        type: 'string',
        requiered: true,
        alias: 'Consecutivo'
    },
    siOrder:{
        type: 'boolean',
        requiered: true,
        alias: 'Es orden compra',
        default: 'true'
    },
    createdAt:{
        type: Date,
        requiered: true,
        alias: 'Fecha creación'
    },invoicedAt:{
        type: Date,
        alias: 'Fecha facturación',
        default: null
    },seller:{
        type: 'string',
        requiered: true,
        alias: 'Vendedor id'
    },
    sellerName:{
        type: 'string',
        requiered: false,
        alias: 'Vendedor'
    },
    client:{
        type: 'string',
        requiered: true,
        alias: 'Cliente'
    },
    nit:{
        type: 'string',
        requiered: true,
        alias: 'Nit'
    },
    delivery:{
        type: 'date',
        requiered: true,
        alias: 'Despachar'
    },
    notes:{
        type: 'string',
        alias: 'notas'
    },
    state:{
        type: 'number',
        default:0,
        alias: 'Estado'
    },
    id_compras:{
        type: 'string',
        alias: 'Id comparas'
    },
    totalReq:{
        type: 'number',
        default:0,
        alias: 'Total pedido'
    },
    TotalDisp:{
        type: 'number',
        default:0,
        alias: 'Total despacahado'
    },
    orderItem:[{
        loteAveria:{
            type: 'string'
        },
        causalAveria:{
            type: 'string'
        },
        code: {
            type: 'string',
            requiered: true
        },
        codeBar: {
            type: 'string',
            default:'--'
        },
        product: {
            type: 'string',
            requiered: true
        },
        qty: {
            type: 'number',
            requiered: true
        },
        dispatch: {
            type: 'number',
            default: 0,
            requiered: true
        },
        historyDisp:[{
            fechaHistory:{
                type: 'date',
                requiered: true
            },
            dspHistory:{
                type: 'string'
            },
            qtyHistory: {
                type: 'number',
                requiered: true
            },
            loteVenta:{
                type: 'string'
            },
            avResponse:{
                type: 'string'
            },
            package:{
                type: 'number',
                default: 0
            }
        }]
    }]
},{
    timestamps: true,
    versionKey: false 
});


module.exports = model('Order',OrderSchema);