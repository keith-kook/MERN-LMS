import express from 'express';
//import formidable from 'express-formidable';

const router = express.Router();

// middleware
import {
  requireSignin,
  isInstructor,
  singleFileMulter,
  singleVideoMulter,
} from '../middlewares';

// controllers
import {
  uploadImage,
  removeImage,
  create,
  update,
  read,
  uploadVideo,
  removeVideo,
  updateVideo,
  addLesson,
  removeLesson,
  updateLesson,
} from '../controllers/course';

// image
router.post(
  '/course/upload-image',
  singleFileMulter('courseImage', 'public/uploads'),
  requireSignin,
  uploadImage
);
router.post('/course/remove-image', requireSignin, removeImage);

// course
router.post('/course', requireSignin, isInstructor, create);
router.put('/course/:slug', requireSignin, update);
router.get('/course/:slug', read);

router.post(
  '/course/upload-video/:instructorId',
  singleVideoMulter('video', 'public/uploads/videos'),
  requireSignin,
  uploadVideo
);
router.post('/course/remove-video/:instructorId', requireSignin, removeVideo);
router.put(
  '/course/update-video/:instructorId/:videoId',
  singleVideoMulter('video', 'public/uploads/videos'),
  requireSignin,
  updateVideo
);
router.post('/course/lesson/:slug/:instructorId', requireSignin, addLesson);
// update
router.put('/course/lesson/:courseId/:lessonId', requireSignin, updateLesson);

router.put('/course/:slug/:lessonId', requireSignin, removeLesson);
module.exports = router;
