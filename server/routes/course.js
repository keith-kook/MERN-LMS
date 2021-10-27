import express from 'express';
//import formidable from 'express-formidable';

const router = express.Router();

// middleware
import {
  requireSignin,
  isInstructor,
  singleFileMulter,
  singleVideoMulter,
  isEnrolled,
} from '../middlewares';

// controllers
import {
  uploadImage,
  removeImage,
  courses,
  create,
  update,
  read,
  uploadVideo,
  removeVideo,
  updateVideo,
  addLesson,
  removeLesson,
  updateLesson,
  publishCourse,
  unpublishCourse,
  checkEnrollment,
  freeEnrollment,
  paidEnrollment,
  userCourses,
  stripeSuccess,
  markCompleted,
  listCompleted,
  markIncomplete,
} from '../controllers/course';

router.get('/courses', courses);
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

// publish course
router.put('/course/publish/:courseId', requireSignin, publishCourse);
// unpublish course
router.put('/course/unpublish/:courseId', requireSignin, unpublishCourse);

// update
router.put('/course/lesson/:courseId/:lessonId', requireSignin, updateLesson);

router.put('/course/:courseId/:lessonId', requireSignin, removeLesson);

router.get('/check-enrollment/:courseId', requireSignin, checkEnrollment);
// enrollment
router.post('/free-enrollment/:courseId', requireSignin, freeEnrollment);
router.post('/paid-enrollment/:courseId', requireSignin, paidEnrollment);
router.get('/stripe-success/:courseId', requireSignin, stripeSuccess);

router.get('/user-courses', requireSignin, userCourses);
router.get('/user/course/:slug', requireSignin, isEnrolled, read);

// mark completed
router.post('/mark-completed', requireSignin, markCompleted);
router.post('/list-completed', requireSignin, listCompleted);
router.post('/mark-incomplete', requireSignin, markIncomplete);

module.exports = router;
