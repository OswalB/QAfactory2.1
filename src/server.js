const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const flash = require('connect-flash');  
const session = require('express-session');
const passport = require('passport');
const MongoStore = require("connect-mongo");
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI;

//initializations
const app = express();
require('./config/passport');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir : path.join(app.get('views'), 'layouts'),
    partialsDir : path.join(app.get('views'), 'partials'),
    extname : '.hbs',
    helpers: {
       
    }
}));

app.set('view engine', '.hbs');
//middlewares





app.use(morgan('dev')); 
app.use(express.urlencoded({extended: false}));
app.use(express.json());


const Handlebars = require('handlebars');




const configData = JSON.parse(fs.readFileSync('./src/config/config.json'));

Handlebars.registerHelper('config', function(key) {
  return configData[key];
});





const oneWeek = 7 * 24 * 60 * 60 * 1000; // 

app.use(session({
    secret: 'cathyca82',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneWeek * 2},
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        autoReconnect: true,
        autoRemove : 'disabled'
        
    })

}));

app.use(passport.initialize());
app.use(passport.session());  
app.use(flash());



//global variables

app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    if(req.user){ 
        res.locals.nik = req.user.name;
        res.locals.admin= req.user.administrador;
        res.locals.disp= req.user.despachador;
        res.locals.owner = req.user.vendedor;
        res.locals.operario = req.user.operario;
    
    }
    next();

})


//routes 

app.use(require('./routes/domain.routes'));
app.use(require('./routes/core.routes'));

//static files 
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', )

module.exports = app;