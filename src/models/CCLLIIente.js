const {Schema, model} = require('mongoose');

const UserSchema = new Schema({ 
    name:{
            type:'String',
            require: true,
            alias: 'Usuario',
            failMsg:'Campo requerido, mínimo 8 caracteres',
            minlength: 8,
            maxlength:64
        },
    alias:{
        type:'String', 
        alias: 'Alias',
        failMsg:'Máximo 4 caracteres',
        maxlength: 4
        
    },
    ccnit:{
        type:'String', 
        require: true, 
        unique: true, 
        alias: 'C.C./Nit.',
        
    },
    phone:{
        type:'String', 
        require: true, 
        alias: 'Teléfono', 
    },
    salesGroup:{
        type:'String', 
        alias: 'Grupo ventas', 
        require: true,
        default: '0'
    },
    pin:{
        type:'Number', 
        alias: 'Pin', 
        default: 0,
        require: true,
        unique:false
    },
    sesion:{
        type:'Number', 
        default: 30, 
        alias: 'Dias sesion',
        require: true,
    },
    password:{
        type:'String', 
        alias: 'Password'
    },
    cliente:{
        type: 'Boolean', 
        alias: 'Cliente',
        default: false
    },
    proveedor:{
        type: 'Boolean', 
        alias: 'Proveedor',
        default: false
    },
    operario:{
        type: 'Boolean', 
        default: false, 
        alias: 'Operario'},
    vendedor:{
        type: 'Boolean', 
        alias: 'Vendedor',
        default: false
    },
    despachador:{
        type: 'Boolean',
        alias: 'Despachador',
        default: false
    },
    administrador:{ 
        type: 'Boolean', 
        alias: 'Admin',
        default: false
    }
},{
    timestamps: true,
    versionKey: false 
});



  

module.exports = model('Client', UserSchema);