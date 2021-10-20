import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { unlinkSync } from 'fs';
import { Image } from '../models/image';

const router = express.Router();

// middleware
import { requireSignin, isInstructor } from '../middlewares';

// controllers
import { removeImage, create } from '../controllers/course';

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    cb(
      null,
      path.basename(file.originalname, path.extname(file.originalname)) +
        '-' +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post(
  '/course/upload-image',
  upload.single('courseImage'),
  async (req, res) => {
    const { filename: image } = req.file;

    await sharp(req.file.path)
      .resize(720, 500)
      .jpeg({ quality: 100 })
      .toFile(path.resolve(req.file.destination, 'course', image));
    unlinkSync(req.file.path);

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.hostname}/public/uploads/course/`;
    // pass data into model
    const newImage = new Image({
      key: fileName,
      image: `${basePath}${fileName}`,
    });
    const data = await newImage.save();
    return res.send(data);
  }
);

router.post('/course/remove-image', removeImage);

// course
router.post('/course', requireSignin, isInstructor, create);

module.exports = router;
