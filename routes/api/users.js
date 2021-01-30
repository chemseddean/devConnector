const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')
const gravatar = require('gravatar');
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config');

// @route   POST api/users
// @desc    Register user
// @access  Public 
router.post(
    '/',
    [
    check('name', 'Name is required').notEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),
    check('email', 'Email is required').notEmpty()
    ],

    async (req, res) => {
    const errors = validationResult(req) 
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() })
    }
    
    const {name, email, password} = req.body

    try{
        let user = await User.findOne({email})
        //check if user exists
        if (user) {
            return res.
            status(400).
            json({
                 errors : [{ msg : 'User already exists'}]
                });
        }
        //get user avatar
        const avatar = gravatar.url(email, {
            s: '200', //default size
            r: 'pg',  //rating 
            d: 'mm'   //default avatar
        })

        user = new User({
            name, 
            email,
            avatar, 
            password
        })

        //Encrypt password
        const salt = await bcrypt.genSalt(10)
            //hash the password
        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user:{
                id: user.id,
            }
        }

        //Sign the token
        jwt.sign(
            payload, 
            config.get('jwttoken'), 
            {expiresIn : 360000},
            (err, token)=>{
                if(err) throw err; 
                res.json({ token });
            }); 

        //res.send('User registered')
    } catch (e){
        console.error(e.message)
        res.status(500).send('Server error')
    }

});

module.exports = router;