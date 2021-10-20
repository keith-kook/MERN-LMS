import express from 'express';

const router = express.Router();

// middleware
import { requireSignin, isInstructor, singleImageMulter } from '../middlewares';

// controllers
import { uploadImage, removeImage, create, read } from '../controllers/course';

// image
router.post(
  '/course/upload-image',
  singleImageMulter('courseImage'),
  uploadImage
);
router.post('/course/remove-image', removeImage);

// course
router.post('/course', requireSignin, isInstructor, create);
router.get('/course/:slug', read);

module.exports = router;
