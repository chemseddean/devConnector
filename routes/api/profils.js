const express = require('express');
const { restart } = require('nodemon');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profil')
const User = require('../../models/User')

const {check, validationResult} = require('express-validator')
 
// @route   GET api/profils/me
// @desc    Get current user's profile
// @access  Private 
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne(
        { user: req.user.id}).
            populate(
                'user', 
                ['name', 'avatar']
                )
        
        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'})
        }
        res.json(profile)
        
    } catch (e) {
        consol.error(err.message); 
        res.status(500).send('Server Error')
    }
})

// @route   POST api/profils/me
// @desc    Create/Update user profile
// @access  Private 

router.post('/', (req, res) => {
    
})
module.exports = router;