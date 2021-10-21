import expressJwt from 'express-jwt';
import User from '../models/user';
import multer from 'multer';
import path from 'path';
import slugify from 'slugify';

export const requireSignin = expressJwt({
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
});

export const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).exec();
    if (!user.role.includes('Instructor')) {
      return res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

export const singleFileMulter = (newFile, directory) => {
  const storage = multer.diskStorage({
    destination: directory, // Destination to store file
    filename: function (req, file, cb) {
      cb(
        null,
        slugify(
          path.basename(file.originalname, path.extname(file.originalname))
        ) +
          '-' +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  });

  const upload = multer({ storage: storage });
  return upload.single(newFile);
};

export const singleVideoMulter = (newFile, directory) => {
  const videoStorage = multer.diskStorage({
    destination: directory, // Destination to store video
    filename: (req, file, cb) => {
      cb(
        null,
        slugify(
          path.basename(file.originalname, path.extname(file.originalname))
        ) +
          '-' +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  });

  const videoUpload = multer({
    storage: videoStorage,
    limits: {
      fileSize: 100000000, // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
      // upload only mp4 and mkv format
      if (!file.originalname.toLowerCase().match(/\.(mp4|MPEG-4|mkv)$/)) {
        return cb(new Error('Please upload a video'));
      }
      cb(undefined, true);
    },
  });

  return videoUpload.single(newFile);
};
