const uuid = require('uuid').v4;
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
        console.log(users);
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again letter', 500)
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ setters: true })) });
}

const signup = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Singning up faile, please try again later', 500);
        return next(error)
    }
    if (existingUser) {
        const error = new HttpError('Could not create user, email already exists', 422);
        return next(error)
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {

        const error = new HttpError('Could not create user, please try again.', 500);
        return next(eror);
    }
    const createUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {

        await createUser.save();

    } catch (err) {
        console.log(err);
        const error = new HttpError('Cant create the user', 422);
        return next(error)
    }

    let token;
    try {
        token = jwt.sign({ userId: createUser._id, email: createUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError('Singning up faile, please try again later', 500);
        return next(error)
    }

    res.status(201).json({ userId: createUser._id, email: createUser.email, token: token});
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Could not identify user, credentials seem to be wrong', 401);
        return next(error)
    }
    if (!existingUser) {
        const error = new HttpError('invalid credential, could not log you in', 403);
        return next(error)
    }
    let isValidPassword = false;
    try {

        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Could not log you in, please check your credential and try aganin.', 500);
        return next(error);
    }
    if (!isValidPassword) {
        const error = new HttpError('invalid credential, could not log you in', 401);
        return next(error)
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_KEY, { expiresIn: '1h' });
    } catch (err) {
        const error = new HttpError('Login in faile, please try again later', 500);
        return next(error)
    }
    res.json({ userId: existingUser._id, email: existingUser.email, token: token});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;