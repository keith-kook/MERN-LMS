// import AWS from "aws-sdk";
import { nanoid } from 'nanoid';
import { Image } from '../models/image';
import { Video } from '../models/video';
import { unlink } from 'fs';
import mongoose from 'mongoose';
import Course from '../models/course';
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

export const removeLesson = async (req, res) => {
  const { slug, lessonId } = req.params;
  const course = await Course.findOne({ slug }).exec();
  if (req.user._id != course.instructor) {
    return res.status(400).send('Unauthorized');
  }

  const deletedCourse = await Course.findByIdAndUpdate(course._id, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();

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
