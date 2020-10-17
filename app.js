const express = require('express');
const bodyParser = require('body-parser');
const path=require('path');
const mongoose =require('mongoose');
const placesRouters = require('./routes/places-routes');
const usersRouters = require('./routes/users-routes')
const fs=require('fs');
const app = express();
const HttpError = require('./models/http-error');
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads','images')));
app.use(express.static(path.join('public')));



app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
});
app.use('/api/places', placesRouters);
app.use('/api/users', usersRouters);

app.use((req, res, next)=>{
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

/*app.use((req, res, next)=>{
    const error = new HttpError('Could not find this route', 404);
    throw error;
})*/



app.use((error, req, res, next) => {
    if(req.file){
        fs.unlink(req.file.path, (err)=>{
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message } || 'An unknow error occurred!');
})
const URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hjsif.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(URL)
    .then(()=>{
        app.listen(process.env.PORT || 5000);
    })
    .catch(err =>{
        console.error(err);
    });


