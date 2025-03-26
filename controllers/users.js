const User=require('../models/users')
module.exports.renderRegisterForm=(req,res)=>{
    res.render('users/regiser');
}
module.exports.registerUser=async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({email,username});
        const registeredUser=await User.register(user,password);
        req.login(registeredUser,err=>{
            if (err) return next(err);
            req.flash('success','Welcome to Yelp Camp!')
            res.redirect('/campgrounds');
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}
module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login');
}
module.exports.login=(req,res)=>{
    req.flash('success','welcome back!');
    if (res.locals.redirectUrl) res.redirect(`${res.locals.redirectUrl}`);
    else res.redirect('/campgrounds');
    
}
module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}