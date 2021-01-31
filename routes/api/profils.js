const express = require('express');
const { restart } = require('nodemon');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
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
                [
                'name', 
                'avatar'
                ]
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


// @route   POST api/profils
// @desc    Create/Update user profile
// @access  Private 
router.post('/', [auth, [
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills are required').notEmpty()
]
], 

async (req, res) =>  {
const errors = validationResult(req)
if (!errors.isEmpty()){
    return res.status(400).
            json({ errors: errors.array() })
}

    const{ 
        company,
        website, 
        location, 
        bio,
        status, 
        githubusername,
        skills, 
        youtube, 
        facebook, 
        twitter, 
        instagram, 
        linkedin,
    } = req.body

    // Build profile object
    const profileFields = {}

    profileFields.user = req.user.id; 
    
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
        profileFields.skills = skills.
        split(',').
        map(skill => skill.trim())

    }
 
    // Build social object
    profileFields.social = {}
    
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram
    
    try {
        let profile = await Profile.findOne({ user: req.user.id })
        
        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id}, 
                {$set: profileFields}, 
                {new : true}
                );

            return res.json(profile)
        }

        // Create profile
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)
            
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Server Error')
    }

})


// @route   GET api/profils
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) =>{
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/profils/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) =>{
    try {
        const profile = await Profile.
        findOne({ user: req.params.user_id }).
        populate('user', ['name', 'avatar'])

        if (!profile) 
            return res.status(400).
                json({msg: 'There is no profile for this user'})
        
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        if(error.kind == 'ObjectId'){
            return res.status(400).
            json({msg: 'There is no profile for this user'})
        }

        res.status(500).send('Server Error')
    }
})


// @route   DELETE api/profils
// @desc    Delete profile,user & post
// @access  Private
router.delete('/', auth, async (req, res) =>{
    try {
        //remove users posts

        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // remove user
        await User.findOneAndRemove({ _id: req.user.id })

        res.json({msg: 'User deleted'})
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
        }

    
})


// @route   PUT api/profils/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [auth,
[
    check('title', 'Title is required').notEmpty(), 
    check('company', 'Company is required').notEmpty(), 
    check('from', 'From date is required').notEmpty()

]], 
async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty())
        {return res.status(400).json({ errors: errors.array()})}
    
    const{
        title, 
        company, 
        location, 
        from, 
        to,
        current, 
        description
    } = req.body

    const newExp = {
        title, 
        company, 
        location, 
        from, 
        to, 
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id})
        
        profile.experience.unshift(newExp)

        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/profils/experience/expr_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) =>{
try {
    const profile = await Profile.findOne({ user: req.user.id})

    //Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

    profile.experience.splice(removeIndex, 1)

    await profile.save()

    res.json(profile)
} catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
}
})

// @route   PUT api/profils/education
// @desc    Add profile education
// @access  Private
router.put('/education', [auth,
    [
        check('school', 'school is required').notEmpty(), 
        check('fieldofstudy', 'Field of study is required').notEmpty(), 
        check('from', 'From date is required').notEmpty()
    
    ]], 
    async (req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty())
            {return res.status(400).json({ errors: errors.array()})}
        
        const{
            school, 
            fieldofstudy, 
            degree, 
            from, 
            to,
            current, 
            description
        } = req.body
    
        const newExp = {
            school, 
            fieldofstudy, 
            degree,  
            from, 
            to, 
            current,
            description
        }
    
        try {
            const profile = await Profile.findOne({ user: req.user.id})
            
            profile.education.unshift(newExp)
    
            await profile.save()
            res.json(profile)
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server Error')
        }
    })
    
// @route   DELETE api/profils/education/edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) =>{
    try {
        const profile = await Profile.findOne({ user: req.user.id})
    
        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.exp_id)
    
        profile.education.splice(removeIndex, 1)
    
        await profile.save()
    
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
    })



module.exports = router;