
const router = require('express').Router();
const UserController = require('../controllers/userController');

router.get('/getMyPosts', UserController.getMyPosts);
router.get('/getUserPosts', UserController.getUserPosts);
router.post('/follow', UserController.followOrUnfollowUserController);
router.get('/getFeedData', UserController.getPostOfFollowingController);
router.delete('/', UserController.deleteMyProfile);

router.get('/getMyInfo', UserController.getMyInfo);

router.put('/', UserController.updateUserProfile);
router.post('/getUserProfile', UserController.getUserProfile);


module.exports = router;