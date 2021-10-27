import User from '../models/user';
//import stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
//import queryString from 'query-string';
import Course from '../models/course';

export const makeInstructor = async (req, res) => {
  try {
    // 1. find user from db
    const user = await User.findById(req.user._id).exec();
    // 2. if user dont have stripe_account_id yet, then create new
    if (!user.stripe_account_id) {
      const account = uuidv4();
      //const account = await stripe.accounts.create({ type: "express" });
      console.log('ACCOUNT => ', account);
      user.stripe_account_id = account;
      user.save();
    }
    // 3. create account link based on account id (for frontend to complete onboarding)
    // const accountLink = await stripe.accountLinks.create({
    //   account: user.stripe_account_id,
    //   refresh_url: process.env.STRIPE_REDIRECT_URL,
    //   return_url: process.env.STRIPE_REDIRECT_URL,
    //   type: 'account_onboarding',
    // });
    // //   console.log(accountLink)
    // 4. pre-fill any info such as email (optional), then send url resposne to frontend
    // accountLink = Object.assign(accountLink, {
    //   'stripe_user[email]': user.email,
    // });
    // // 5. then send the account link as response to fronend
    //res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
    res.send(process.env.STRIPE_REDIRECT_URL);
  } catch (err) {
    console.log('MAKE INSTRUCTOR ERR ', err);
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    //const account = await stripe.accounts.retrieve(user.stripe_account_id);

    // console.log("ACCOUNT => ", account);
    if (!user.stripe_account_id) {
      return res.staus(401).send('Unauthorized');
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: true,
          $addToSet: { role: 'Instructor' },
        },
        { new: true }
      )
        .select('-password')
        .exec();
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};

export const currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select('-password').exec();
    if (!user.role.includes('Instructor')) {
      return res.sendStatus(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};

export const instructorCourses = async (req, res) => {
  try {
    //console.log('InstructorCourses');
    //return;
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 })
      .exec();
    res.json(courses);
  } catch (err) {
    console.log(err);
  }
};

export const studentCount = async (req, res) => {
  try {
    const users = await User.find({ courses: req.body.courseId })
      .select('_id')
      .exec();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

export const instructorBalance = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).exec();
    //const balance = await stripe.balance.retrieve({
    //  stripeAccount: user.stripe_account_id,
    //});

    const balance = {
      pending: [
        {
          amount: 1000.99,
          currency: 'usd',
        },
      ],
    };
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};
