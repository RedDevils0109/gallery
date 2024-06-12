const express = require('express');
const router = express.Router({ mergeParams: true });
const Gallery = require('../models/gallery')
const User = require('../models/user')

const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage });



const catchAsync = require('../middleware/catchAsync')
const isLogin = require('../middleware/isLogin')
const { addFolder, deleteFolder, getFolder, getEditFolder, putEditFolder } = require('../controllers/folder')

router.use(isLogin)

router.get('/', catchAsync(async (req, res) => {
    const userId = req.session.user._id
    const gallery = await Gallery.findOne({ userId: userId })
    // console.log(gallery)
    res.render('pages/gallery', { gallery })
}))
router.post('/addFolder', catchAsync(addFolder))
router.get('/folder/:id', catchAsync(getFolder))
router.get('/folder/edit/:id', catchAsync(getEditFolder))
router.put('/folder/edit/:id', upload.array('image'), putEditFolder)

router.delete('/folder/:id', catchAsync(deleteFolder));


module.exports = router
