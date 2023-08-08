const {Schema, model}= require('mongoose');

const OrderSchema = new Schema({
    
    seller:{
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
        loteVenta:{
            type: 'string'
        },
        code: {
            type: 'string',
            requiered: true
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
            requiered: true
        },
        dispatchBy: {
            type: 'string',
            requiered: false
        },
        dispatchDate:{
            type: 'date'
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
            }
        }]
    }]
},{
    timestamps: true,
    versionKey: false 
});


module.exports = model('Order',OrderSchema);