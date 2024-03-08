const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");

const followOrUnfollowUserController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const currUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const currUser = await User.findById(currUserId);

        if(currUserId === userIdToFollow){
            return res.send(error(409, 'User cannot follow themselves'));
        }

        if(!userToFollow){
            return res.send(error(404, 'User to follow not found'));
        }

        if(currUser.followings.includes(userIdToFollow)){
            // Already followed
            const followingIndex = currUser.followings.indexOf(userIdToFollow);
            currUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followings.indexOf(currUserId);
            userToFollow.followers.splice(followerIndex, 1);
        }else{
            userToFollow.followers.push(currUserId);
            currUser.followings.push(userIdToFollow);
        }
        await userToFollow.save();
        await currUser.save();
        return res.send(success(200, {user:userToFollow}));

    } catch (e) {
        return res.send(error(500, e.message));
    }
};

const getPostOfFollowingController = async (req, res) =>{
    try {
        const currUserId = req._id;
        const currUser = await User.findById(currUserId).populate("followings");

        const fullPosts = await Post.find({
            owner: {
                $in: currUser.followings,
            },
        }).populate('owner');

        const posts = fullPosts
            .map((item) => mapPostOutput(item, req._id))
            .reverse();
        
        const followingsIds = currUser.followings.map((item) => item._id);
        followingsIds.push(req._id);

        const suggestions = await User.find({
            _id: {
                $nin: followingsIds,
            },
        });

        return res.send(success(200, {...currUser._doc, suggestions, posts}));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getMyPosts = async(req, res) =>{
    try {
        const currUserId = req._id;
        const posts = await Post.find({owner:currUserId}).populate('likes');
        return res.send(success(200, posts));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getUserPosts = async(req, res) =>{
    try {
        const userId = req.body.userId;
        if(!userId){
            return res.send(error(400, "userId is required"));
        }
        const posts = await Post.find({owner:userId}).populate('likes');
        return res.send(success(200, posts));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const deleteMyProfile = async(req, res) =>{
    
    try {
        const currUserId = req.body._id;
        const currUser = await User.find({"_id":currUserId});

        // Delete all posts
        await Post.deleteMany({
            owner:currUserId
        })
        
        // Delete user from followers following
        currUser?.followers?.forEach(async (followerId) =>{
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(currUserId);
            follower.followings.splice(index,1);
            await follower.save();

        })

        // Delete user from followings follower
        currUser?.follings?.forEach(async (followingId) =>{
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(currUserId);
            following.followers.splice(index,1);
            await following.save();

        })

        // Delete user from liked posts
        const allPosts = await Post.find();
        allPosts?.forEach(async (post)=>{
            const index = post.likes.indexOf(currUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        //Delete user
        console.log("Current User id : ",currUserId);
        await User.deleteOne({"_id":currUserId})

        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })
        return res.send(success(200, "Account Deleted Successful"));

    } catch (e) {
        return res.send(error(500, e.message));
    }
}


const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id);
        return res.send(success(200, { user }));
    } catch (e) {
        return res.send(error(500, "Something Went Wrong"));
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;

        const user = await User.findById(req._id);

        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = bio;
        }
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: "profileImg",
            });
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id,
            };
        }
        await user.save();
        return res.send(success(200, { user }));
    } catch (e) {
        // console.log('put e', e);
        return res.send(error(500, e.message));
    }
};

const getUserProfile = async (req, res) => {
    try {
        
        const userId = req.body.userId;
        if(!userId){
            return res.send(error(400, "User Id required"));
        }
        const user = await User.findById(userId).populate({
            path: "posts",
            populate: {
                path: "owner",
            },
        });
        const fullPosts = user.posts;
        const posts = fullPosts
            .map((item) => mapPostOutput(item, req._id))
            .reverse();
        return res.send(success(200, { ...user._doc, posts }));
    } catch (e) {
        // console.log('error put', e);
        return res.send(error(500, e.message));
    }
};


module.exports = {
    followOrUnfollowUserController,
    getPostOfFollowingController,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
}