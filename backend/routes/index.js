const router = require('express').Router();
const authRouter = require('./authRouter');
const postRouter = require('./postRouter');
const userRouter = require('./userRouter');
const verifyUser = require('../middlewares/verifyUser');

router.use('/auth', authRouter);
router.use('/posts', verifyUser, postRouter);
router.use('/user', verifyUser, userRouter);
module.exports = router;