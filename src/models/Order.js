const {Schema, model}= require('mongoose');

const OrderSchema = new Schema({
    
    createdAt:{
        type: 'string',
        requiered: true,
        alias: 'Fecha creación'
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
            }
            
        }]
    }]
},{
    timestamps: true,
    versionKey: false 
});


module.exports = model('Order',OrderSchema);