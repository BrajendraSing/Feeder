const router = require('express').Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPostController);
router.post('/like', postController.likeAndUnlikePostController);
router.put('/', postController.updatePostController);
router.delete('/', postController.deletePostController);

module.exports = router;