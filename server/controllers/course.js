// import AWS from "aws-sdk";
import { nanoid } from 'nanoid';
import { Image } from '../models/image';
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
