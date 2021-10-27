// import AWS from "aws-sdk";
import { nanoid } from 'nanoid';
import { Image } from '../models/image';
import { Video } from '../models/video';
import Completed from '../models/completed';
import { unlink } from 'fs';
import mongoose from 'mongoose';
import Course from '../models/course';
import User from '../models/user';
import slugify from 'slugify';
import sharp from 'sharp';
import { unlinkSync } from 'fs';
import path from 'path';

// const awsConfig = {
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   apiVersion: process.env.AWS_API_VERSION,
// };

// const S3 = new AWS.S3(awsConfig);

export const removeImage = async (req, res) => {
  // console.log(req.body);
  // return;
  try {
    const { Key, id } = req.body.image;

    const path = `public/uploads/course/${Key}`;
    //console.log(id);
    unlink(path, err => {
      if (err) {
        console.error(err);
        return res.status(404).json({ msg: 'Image cannot found' });
      }

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Invalid product id' });
      }

      try {
        Image.findByIdAndRemove(id).exec();
        res.json({ msg: 'Image deleted' });
      } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Image not found' });
        }
        res.status(500).send('Server Error');
      }
    });

    //const { image } = req.body;
    // image params
    // const params = {
    //   Bucket: image.Bucket,
    //   Key: image.Key,
    // };
    // send remove request to s3
    // S3.deleteObject(params, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     res.sendStatus(400);
    //   }
    //   res.send({ ok: true });
    // });
  } catch (err) {
    console.log(err);
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No image');

    const { filename: image } = req.file;
    await sharp(req.file.path)
      .resize(720, 500)
      .jpeg({ quality: 100 })
      .toFile(path.resolve(req.file.destination, 'course', image));
    unlinkSync(req.file.path);
    const fileName = req.file.filename;
    const port = process.env.PORT == 8000 ? `:${process.env.PORT}` : '';
    const basePath = `${req.protocol}://${req.hostname}${port}/public/uploads/course/`;

    // save image data into db
    const newImage = new Image({
      Key: fileName,
      Location: `${basePath}${fileName}`,
    });
    const data = await newImage.save();
    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Unable to upload image.');
  }

  // console.log(req.body);
  // try {
  //   const { image } = req.body;
  //   if (!image) return res.status(400).send('No image');
  //   // prepare the image
  //   const base64Data = new Buffer.from(
  //     image.replace(/^data:image\/\w+;base64,/, ''),
  //     'base64'
  //   );
  //   const type = image.split(';')[0].split('/')[1];
  //   // image params
  //   const params = {
  //     Bucket: 'edemy-bucket',
  //     Key: `${nanoid()}.${type}`,
  //     Body: base64Data,
  //     ACL: 'public-read',
  //     ContentEncoding: 'base64',
  //     ContentType: `image/${type}`,
  //   };
  //   // upload to s3
  //   S3.upload(params, (err, data) => {
  //     if (err) {
  //       console.log(err);
  //       return res.sendStatus(400);
  //     }
  //     console.log(data);
  //     res.send(data);
  //   });
  // } catch (err) {
  //   console.log(err);
  // }
};

export const uploadVideo = async (req, res) => {
  try {
    //console.log(req.file);
    //console.log('req.user._id', req.user._id);
    //console.log(req.params.instructorId);

    if (req.user._id != req.params.instructorId) {
      res.status(400).send('Unauthorised Access');
    }

    if (!req.file) return res.status(400).send('No video');

    const fileName = req.file.filename;
    const port = process.env.PORT == 8000 ? `:${process.env.PORT}` : '';
    const basePath = `${req.protocol}://${req.hostname}${port}/public/uploads/videos/`;

    //save video data into db
    const newVideo = new Video({
      Key: fileName,
      Location: `${basePath}${fileName}`,
    });
    const data = await newVideo.save();
    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Unable to upload video.');
  }
};

export const updateVideo = async (req, res) => {
  try {
    //console.log(`body`, req.body);
    //console.log(req.file);
    //console.log('req.user._id', req.user._id);

    const { videoId } = req.params;
    console.log(`CurrVideoID: ${videoId}`);
    //console.log(`Body: ${req.body}`);

    if (req.user._id != req.params.instructorId) {
      res.status(400).send('Unauthorised Access');
    }

    if (!req.file) return res.status(400).send('No video');

    const fileName = req.file.filename;
    const port = process.env.PORT == 8000 ? `:${process.env.PORT}` : '';
    const basePath = `${req.protocol}://${req.hostname}${port}/public/uploads/videos/`;

    //save new video data into db
    const newVideo = new Video({
      Key: fileName,
      Location: `${basePath}${fileName}`,
    });
    const data = await newVideo.save();
    res.json(data);

    // ToDo
    // Update new video into lesson

    // const updated = await Course.findByIdAndUpdate(
    //   videoId,
    //   {
    //     $push: {
    //       lessons: {
    //         video: { Key: fileName, Location: `${basePath}${fileName}` },
    //       },
    //     },
    //   },
    //   { new: true }
    // )
    //   .populate('instructor', '_id name')
    //   .exec();

    //update video data into db
    // console.log(slug);
    //const course = await Video.findOne({ videoId }).exec();
    // console.log("COURSE FOUND => ", course);
    // console.log('NewFileName' + fileName);
    // const updated = await Video.findByIdAndUpdate(
    //   videoId,
    //   {
    //     $push: {
    //       lessons: {
    //         video: { Key: fileName, Location: `${basePath}${fileName}` },
    //       },
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // ).exec();
    // res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Unable to upload video.');
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.instructorId) {
      res.status(400).send('Unauthorised Access');
    }
    //const { Key } = req.body;
    //console.log('VIDEO REMOVE =====> ', req.body);
    const { Key, id } = req.body;
    console.log(Key);
    const path = `public/uploads/videos/${Key}`;
    //console.log(id);
    unlink(path, err => {
      if (err) {
        console.error(err);
        return res.status(404).json({ msg: 'Video cannot found' });
      }

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ msg: 'Invalid video id' });
      }

      try {
        Video.findByIdAndRemove(id).exec();
        res.json({ msg: 'Video deleted' });
      } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
          return res.status(404).json({ msg: 'Video not found' });
        }
        res.status(500).send('Server Error');
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req, res) => {
  //console.log('CREATE COURSE', req.body);
  //return;
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).send('Title is taken');

    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.user._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Course create failed. Try again.');
  }
};

export const read = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', '_id name')
      .exec();
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};
export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video } = req.body;

    if (req.user._id != instructorId) {
      return res.status(400).send('Unauthorized');
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, content, video, slug: slugify(title) } },
      },
      { new: true }
    )
      .populate('instructor', '_id name')
      .exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Add lesson failed');
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    // console.log(slug);
    const course = await Course.findOne({ slug }).exec();
    // console.log("COURSE FOUND => ", course);
    if (req.user._id != course.instructor) {
      return res.status(400).send('Unauthorized');
    }
    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

// export const removeLesson = async (req, res) => {
//   try {
//     const { slug, lessonId } = req.params;
//     const course = await Course.findOne({ slug }).exec();
//     //console.log('removelesson', course.instructor);
//     if (req.user._id != course.instructor) {
//       return res.status(400).send('Unauthorized');
//     }
//     const deletedCourse = await Course.findByIdAndUpdate(course._id, {
//       $pull: { lessons: { _id: lessonId } },
//     }).exec();
//     res.json({ ok: true });
//   } catch (err) {
//     console.log(err);
//   }
// };

export const removeLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  // if (!mongoose.Types.ObjectId.isValid(`${courseId}`))
  //   return res.status(422).send('Invalid ID');

  // find post
  const courseFound = await Course.findById(`${courseId}`)
    .select('instructor')
    .exec();
  // is owner?
  if (req.user._id != courseFound.instructor._id) {
    return res.status(400).send('Unauthorized');
  }

  // console.log("slug", req.params.slug);
  let course = await Course.findByIdAndUpdate(courseId, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();
  // console.log("remove lesson from this course => ", course);
  res.json({ ok: true });
};

export const updateLesson = async (req, res) => {
  //console.log(`updateLesson`, req.body);
  try {
    const { courseId, lessonId } = req.params;

    // console.log('courseId', courseId);
    // console.log('lessonId', lessonId);

    const { title, content, video, free_preview } = req.body;
    // find post
    const courseFound = await Course.findById(courseId)
      .select('instructor')
      .exec();
    // is owner?
    if (req.user._id != courseFound.instructor._id) {
      return res.status(400).send('Unauthorized');
    }
    const updated = await Course.updateOne(
      { 'lessons._id': lessonId },
      {
        $set: {
          'lessons.$.title': title,
          'lessons.$.content': content,
          'lessons.$.video': video,
          'lessons.$.free_preview': free_preview,
        },
      }
    ).exec();
    console.log('updated => ', updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send('Update lesson failed');
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select('instructor')
      .exec();
    // is owner?
    if (req.user._id != courseFound.instructor._id) {
      return res.status(400).send('Unauthorized');
    }

    let course = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    // console.log("course published", course);
    // return;
    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Publish course failed');
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find post
    const courseFound = await Course.findById(courseId)
      .select('instructor')
      .exec();
    // is owner?
    if (req.user._id != courseFound.instructor._id) {
      return res.status(400).send('Unauthorized');
    }

    let course = await Course.findByIdAndUpdate(
      courseId,
      { published: false },
      { new: true }
    ).exec();
    // console.log("course unpublished", course);
    // return;
    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send('Unpublish course failed');
  }
};

export const courses = async (req, res) => {
  // console.log("all courses");
  const all = await Course.find({ published: true })
    .limit(11)
    // .select("-lessons")
    .populate('instructor', '_id name')
    .populate('categories', '_id name')
    .exec();
  //console.log('============> ', all);
  res.json(all);
};

export const checkEnrollment = async (req, res) => {
  const { courseId } = req.params;
  // find courses of the currently logged in user
  const user = await User.findById(req.user._id).exec();
  // check if course id is found in user courses array
  let ids = [];
  let length = user.courses && user.courses.length;
  for (let i = 0; i < length; i++) {
    ids.push(user.courses[i].toString());
  }
  res.json({
    status: ids.includes(courseId),
    course: await Course.findById(courseId).exec(),
  });
};

export const freeEnrollment = async (req, res) => {
  try {
    // check if course is free or paid
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;

    const result = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec();
    console.log(result);
    res.json({
      message: 'Congratulations! You have successfully enrolled',
      course,
    });
  } catch (err) {
    console.log('free enrollment err', err);
    return res.status(400).send('Enrollment create failed');
  }
};

export const paidEnrollment = async (req, res) => {
  try {
    // check if course is free or paid
    const course = await Course.findById(req.params.courseId)
      .populate('instructor')
      .exec();
    if (!course.paid) return;
    // application fee 30%
    const fee = (course.price * 30) / 100;
    // create stripe session
    const session = {
      id: nanoid(),
      payment_method_types: ['card'],
      // purchase details
      line_items: [
        {
          name: course.name,
          amount: Math.round(course.price.toFixed(2) * 100),
          currency: 'usd',
          quantity: 1,
        },
      ],
      // charge buyer and transfer remaining balance to seller (after fee)
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      // redirect url after successful payment
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    };
    //console.log('SESSION ID => ', session);
    //res.json({ message: 'ok' });

    await User.findByIdAndUpdate(req.user._id, {
      stripeSession: session,
    }).exec();
    res.send(session.success_url);
  } catch (err) {
    console.log('PAID ENROLLMENT ERR', err);
    return res.status(400).send('Enrollment create failed');
  }
};

export const stripeSuccess = async (req, res) => {
  try {
    // find course
    const course = await Course.findById(req.params.courseId).exec();
    // get user from db to get stripe session id
    const user = await User.findById(req.user._id).exec();
    // if no stripe session return
    if (!user.stripeSession.id) return res.sendStatus(400);

    // retrieve stripe session
    // const session = await stripe.checkout.sessions.retrieve(
    //   user.stripeSession.id
    // );
    const session = { payment_status: 'paid' };
    // console.log('STRIPE SUCCESS', session);

    // if session payment status is paid, push course to user's course []
    if (session.payment_status === 'paid') {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id },
        $set: { stripeSession: {} },
      }).exec();
    }
    res.json({ success: true, course });
  } catch (err) {
    console.log('STRIPE SUCCESS ERR', err);
    res.json({ success: false });
  }
};

export const userCourses = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  const courses = await Course.find({ _id: { $in: user.courses } })
    .populate('instructor', '_id name')
    .exec();
  res.json(courses);
};

export const markCompleted = async (req, res) => {
  const { courseId, lessonId } = req.body;
  // console.log(courseId, lessonId);
  // find if user with that course is already created
  const existing = await Completed.findOne({
    user: req.user._id,
    course: courseId,
  }).exec();

  if (existing) {
    // update
    const updated = await Completed.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $addToSet: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } else {
    // create
    const created = await new Completed({
      user: req.user._id,
      course: courseId,
      lessons: lessonId,
    }).save();
    res.json({ ok: true });
  }
};

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.user._id,
      course: req.body.courseId,
    }).exec();
    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

export const markIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const updated = await Completed.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $pull: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
