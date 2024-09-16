const {Schema, model}= require('mongoose');
const TemplateSchema = new Schema({
    idTemplate:{
        type: 'number',
        required: true,
        unique: true,
        alias: 'ID'
    },
    descripcion:{
        type: 'string',
        required: true,
        alias: 'Descripcion'
    },
    model:{
        type: 'string',
        requiered: true,
        alias: 'Modelo'
    },
    pagina:{
        orientation:{
            type: 'string',
            alias: 'Orientacion',
            default: 'p'
        },
        size:{
            type: 'string',
            default: 'letter',
            alias: 'Tamaño'
        },
        ml:{
            type: 'number'
        },
        mr:{
            type: 'number'
        },
        mt:{
            type: 'number'
        },
        mb:{
            type: 'number'
        },
        fieldFilter:{
            type: 'string',
            default: ''
        },
        fieldGroup:{
            type: 'string',
            default: ''
        },
        pagination:{
            type: 'string',
            default: '0'
        }
    },
    headerReport:[{
        col:{
            type: 'number'
        },
        height:{
            type: 'number'
        },
        siBorde:{
            type: 'boolean',
            default: false
        },
        texto:{
            type: 'string'
        },
        align:{
            type: 'number',
        },
        sizeFont:{
            type: 'number'
        },
        colorFont:{
            type: 'string'
        },
        paddingX:{
            type: 'number'
        },
        paddingY:{
            type: 'number'
        },
        colorBg:{
            type: 'string'
        },
        siBg:{
            type: 'boolean',
            default: false
        }
    }],
    headerPage:[{
        col:{
            type: 'number'
        },
        height:{
            type: 'number'
        },
        siBorde:{
            type: 'boolean',
            default: false
        },
        texto:{
            type: 'string'
        },
        align:{
            type: 'number',
        },
        sizeFont:{
            type: 'number'
        },
        colorFont:{
            type: 'string'
        },
        paddingX:{
            type: 'number'
        },
        paddingY:{
            type: 'number'
        },
        colorBg:{
            type: 'string'
        },
        siBg:{
            type: 'boolean',
            default: false
        }
    }],
    headerGroup:[{
        col:{
            type: 'number'
        },
        height:{
            type: 'number'
        },
        siBorde:{
            type: 'boolean',
            default: false
        },
        texto:{
            type: 'string'
        },
        align:{
            type: 'number',
        },
        sizeFont:{
            type: 'number'
        },
        colorFont:{
            type: 'string'
        },
        paddingX:{
            type: 'number'
        },
        paddingY:{
            type: 'number'
        },
        colorBg:{
            type: 'string'
        },
        siBg:{
            type: 'boolean',
            default: false
        }
    }]     

},{
    timestamps: true,
    versionKey: false 
});



module.exports = model('Template',TemplateSchema);
