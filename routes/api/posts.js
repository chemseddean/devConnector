const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator')

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const auth = require('../../middleware/auth')


// @route   POST api/posts
// @desc    Create a route
// @access  Private 
router.post('/', [auth, [
    check('text', 'Text is required').notEmpty(), 
]],
async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({erros: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password')
    const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar, 
        user: req.user.id
    })
    const post = await newPost.save()

    res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }


})

// @route   GET api/posts
// @desc    Get all posts
// @access  Private 
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1})
        res.json(posts)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private 
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
       
        if (!post){
            return res.status(404).json({msg: "Post not found"})
        }
       
        res.json(post)
    } catch (error) {
        console.error(error.message)
        //if invalid post id
         
        if (error.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post not found"})
        }
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/posts/:id
// @desc    delete post by id
// @access  Private 
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
       
        //Check if user owns the post
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: "User not authorized"})
        }

        await post.remove(post)
       
        res.json("Post removed")
    } catch (error) {
        console.error(error.message)
        if (error.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post not found"})
        }
        res.status(500).send('Server Error')
    }
})
module.exports = router;