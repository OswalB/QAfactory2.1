bcryp = require('bcryptjs');
const {Schema, model} = require('mongoose');

const UserSchema = new Schema({ 
    name:           {type:'String',require: true,alias: 'Usuario'},
    alias:          {type:'String', alias: 'Alias'},
    ccnit:          {type:'String', require: true, unique: true, alias: 'C.C./Nit.'},
    phone:          {type:'String', require: true, alias: 'Teléfono'},
    salesGroup:     {type:'String', alias: 'Grupo ventas'},
    pin:            {type:'Number', unique: true, alias: 'Pin'},
    sesion:         {type:'Number', default: 30, alias: 'Dias sesion'},
    password:       {type:'String', require: true, alias: 'Password'},
    cliente:        {type: 'Boolean', alias: 'Cliente'},
    proveedor:      {type: 'Boolean', alias: 'Proveedor'},
    operario:       {type: 'Boolean', default: false, require: true, alias: 'Operario'},
    vendedor:       {type: 'Boolean', require: true, alias: 'Vendedor'},
    despachador:    {type: 'Boolean', require: true, alias: 'Despachador'},
    administrador:  {type: 'Boolean', require: true, alias: 'Admin'}
},{
    timestamps: true,
    versionKey: false 
});


UserSchema.methods.encryptPassword = async password => {
    const salt = await bcryp.genSalt(10);
    return await bcryp.hash(password, salt);
};

UserSchema.methods.matchPassword =  async function(password) {
    return await bcryp.compare(password, this.password);
}
  

module.exports = model('User', UserSchema);