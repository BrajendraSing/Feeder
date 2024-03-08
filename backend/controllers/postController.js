const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2;
const {mapPostOutput} = require('../utils/Utils')


const createPostController = async (req, res) => {
    try {
        const { caption, postImg } = req.body;
        if(!caption || !postImg) {
            return res.send(error(400, 'Caption and postImg are required'))
        }
        const cloudImg = await cloudinary.uploader.upload(postImg, {
            folder: 'postImg'
        })

        const owner = req._id;
        const user = await User.findById(owner);
        const post = await Post.create({
            owner,
            caption,
            image: {
                publicId: cloudImg.public_id,
                url: cloudImg.url
            },
        });
        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, {post}));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const likeAndUnlikePostController = async (req, res) => {
    try {
        const { postId } = req.body;
        const currUserId = req._id;

        const post = await Post.findById(postId).populate('owner');
        if (!post) {
            return res.send(error(404, "Post not found"));
        }

        if (post.likes.includes(currUserId)) {
            const index = post.likes.indexOf(currUserId);
            post.likes.splice(index, 1);
        } else {
            post.likes.push(currUserId);
        }
        await post.save();
        return res.send(success(200, {post: mapPostOutput(post, req._id)}));
    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const updatePostController = async(req, res) =>{
    try {
        const {postId, caption} = req.body;
        const currUserId = req._id;

        const post = await Post.findById(postId);

        if(!post){
            return res.send(error(404, "Post not found"));
        }

        if(post.owner.toString() !== currUserId){
            return res.send(error(500, "Only Owner can update their posts"));
        }

        if(caption){
            post.caption = caption;
        }
        await post.save();
        return res.send(success(200, "Post updated"));
        
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const deletePostController = async(req, res) =>{
    try {
        const {postId} = req.body;
        const currUserId = req._id;

        const post = await Post.findById(postId);
        const currUser = await User.findById(currUserId);

        if(!post){
            return res.send(error(404, "Post not found"));
        }

        if(post.owner.toString() !== currUserId){
            return res.send(error(500, "Only Owner can delete their posts"));
        }

        const index = currUser.posts.indexOf(postId);
        currUser.posts.splice(index, 1);
        await post.deleteOne();
        await currUser.save();

        return res.send(success(200, "Post deleted"));
        
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

module.exports = {
    createPostController,
    likeAndUnlikePostController,
    updatePostController,
    deletePostController
};
