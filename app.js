if (process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express=require('express')
const path=require('path');
const mongoose=require('mongoose')
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate')
const session=require('express-session')
const flash=require('connect-flash')
const campgroundRoutes=require('./routes/campground')
const reviewRoutes=require('./routes/review')
const userRoutes=require('./routes/users')
const passport=require('passport');
const helmet=require('helmet');
const LocalStrategy=require('passport-local');
const User=require('./models/users')
const ExpressError=require('./utils/ExpressError')
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
// const db_url=process.env.DB_URL;
const db_url='mongodb://localhost:27017/yelp-camp';
mongoose.connect(db_url)
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("connection done")
});
const app=express();
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );
  const store = MongoStore.create({
    mongoUrl: db_url,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
});
store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})
const sessionConfig={
    store,
    name:'session',
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user;

    next();
})
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmw7lpgqv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})
app.use((req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})
app.use((err,req,res,next)=>{
    const {status=500}=err;
    if (!err.message) err.message='Something Went Wrong'
    res.status(status).render('error',{err});
})
app.listen(3000,()=>{
    console.log("serving on port 3000")
})