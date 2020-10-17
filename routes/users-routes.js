const express= require('express');
const usersControllers = require('../controllers/users-controllers');
const router = express.Router();
const { check } = require('express-validator');
const fileUpload =require('../middleware/file-upload');

router.get('/', usersControllers.getUsers );

router.post('/signup', fileUpload.single('image'),[check('name').not().isEmpty(), check('email').normalizeEmail(), check('password').isLength({min:6})] , usersControllers.signup);

router.post('/login', usersControllers.login);



module.exports =  router;