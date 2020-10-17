const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator');
const getGoordsForAddress = require('../util/localtion');
const Place = require('../models/places');
const User = require('../models/users');
const mongooseUniqueValidator = require('mongoose-unique-validator');
const mongoose = require('mongoose');
const { create } = require('../models/users');
const fs = require('fs');


const getPlaceById = async (req, res, next)=>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
        console.log(place);
    }catch(err){
        const error=new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }
    if(!place){
        const error = next(new HttpError('Could not find a places for provider id.', 404));
        return next(error);
    }
    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId =  async (req, res, next)=>{
    const userId = req.params.uid;
    //let places;
    let userWithPlaces;
    try{
        userWithPlaces = await User.findById(userId).populate('places');
        console.log(userWithPlaces);
    }catch(err){
        const error = new HttpError('Fetching places failed, please try again later', 500);
        console.log(err);
        return next(error);
    }
    if(!userWithPlaces || userWithPlaces.length ===0){
        //return res.status(404).json({message:'Could not find a place for the user id.'});
        //const error=new Error('Could not find a place for the provider id.');
        //error.code = 404;
        const error = new HttpError('Could not find a places for the user id.', 404);
        console.log(err);
        return next(error);
    }
    //console.log(userWithPlaces.places.map(place => place.toObject({getters: true})));
    res.json({places: userWithPlaces.places.map(place => place.toObject({getters: true}))});
}


const createPlace = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        next(new HttpError('Invalid inputs passed, please check your data',422));
    }
    const { title, description, address } = req.body;
    let coordinates; 
    try{
        coordinates = await getGoordsForAddress(address);
    }catch(e){
        console.log(e);
        next(e);
    }
    let user;
    try{
        user = await User.findById(req.userData.userId);
    }catch(err){
        const error= new HttpError('Creating place faile, please try again', 500);
        return next(error);
    }
    if(!user){
        const error=new HttpError('Could not find user for provided id', 401);
        return next(error);
    }
    let createPlace; 

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();      
        createPlace = new Place({
            title,
            description,
            location: coordinates,
            address,
            image: req.file.path,
            creator: req.userData.userId
        });
        await createPlace.save({session: sess});
        user.places.push(createPlace);
        await user.save({session: sess});
        sess.commitTransaction();
    }catch(err){
         console.log(err);
        const error = new HttpError('Creating place failed, please trye again');
        return next(error);
    }
    //DUMMY_PLACES.push(createPlace);
    res.status(201).json({place: createPlace.toObject({setters:true})});
}


const updatePlace = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data',422))
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId)

    }catch(err){

        const error= new HttpError('Something went wrong , could not update place', 500);
        return next(error);
    }

    if(place.creator.toString()!==req.userData.userId){
        const error= new HttpError('You are not allow to edit this place', 401);
        return next(error);   
    }

    place.title = title;
    place.description = description;
    try{
        await place.save()
    }catch(err){
        console.log(err);
        const error = new HttpError('Something went wrong, cuold not update place', 500);
        return next(error);
    }
    console.log(place.toObject({setters: true}));
    res.status(200).json({place: place.toObject({setters: true})});
}

const deletePlace = async (req, res, next) =>{
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');

    }catch(err){

        const error= new HttpError('Something went wrong , getting the place', 500);
        return next(error);
    }
    if(!place){
        const error=new HttpError('could not find place for this id.',404);
        return next(error);
    }

    if(place.creator.id!==req.userData.userId){
        const error= new HttpError('You are not allow to delete this place', 401);
        return next(error);   
    }
    const imagePath=place.image;
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.remove({session:sess});
        place.creator.places.pull(place);
        await place.creator.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        const error= new HttpError('Something went wrong deleting the place', 500);
        return next(error);       
    }
    fs.unlink(imagePath,err=>{
        console.log(err);
    })
    res.status(200).json({message: 'Delete place.'})
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;