const router = require("express").Router();
const User = require("../models/Patient");
const Doctor = require("../models/Doctor");
const ticket = require("../models/Ticket");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  authorization,
} = require("./verifyToken");
const cors = require("cors");
const { body } = require("express-validator");
const { findById } = require("../models/Patient");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const NewUser = new User({
      Pat_username: req.body.Pat_username,
      pat_FirstName: req.body.pat_FirstName,
      pat_Lastname: req.body.pat_Lastname,
      pat_Email: req.body.pat_Email,
      pat_Gender: req.body.pat_Gender,
      pat_password: CryptoJS.AES.encrypt(
        req.body.pat_password,
        process.env.PASS_SEC
      ).toString(),
      pat_birthday: req.body.pat_birthday,
      pat_InsuranceNo: req.body.pat_InsuranceNo,
    });
    const savedUser = await NewUser.save();
    console.log(NewUser);
  } catch (err) {
    res.render("signUp.ejs", { errorMessage: "Credentials already in use" });
  }
  try {
    //  const savedUser = await NewUser.save();
    //  console.log(NewUser);
    
    res.render("signIn.ejs", { errorMessage: "Account Created Successfully" });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ Pat_username: req.body.Pat_username });
    !user && res.render("signIn.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.pat_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.pat_password &&
      res.render("signIn.ejs", { errorMessage: "Wrong password" });
    // res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      {
        expiresIn: "3d",
      }
      // (err, token) => {
      //   if (err)
      //     return res
      //       .status(400)
      //       .send({ msg: "Something went wrong. Please try again" });
      //   return res.json({
      //     accessToken: token,
      //     name: user.pat_FirstName,
      //     role: "user",
      //   });
      // }
    );
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    // });
    const token = req.body.token;
    const name = user.pat_FirstName;
    console.log(accessToken);
    console.log(name);
    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .render("Patienthome.ejs", { name: name });
     
    //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});

// router.get("/login-test", verifyTokenAndAuthorization, (req, res) => {
//   const userName = User;
//   userName
//     .findById(user._id)
//     .then((result) => {
//       console.log(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   console.log(pat_FirstName, "test");

//   const { pat_password, ...others } = user._doc;
// });
router.put("/profile-setting-Update", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  const lastName = user.pat_Lastname;
  const Ins = user.pat_InsuranceNo;
  try {
    const upadateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200);
  } catch (err) {
    console.log(err);
    res.satuts(500);
  }
  res.render("Profile.ejs", {
    name: name,
    email: email,
    lastName: lastName,
    Ins: Ins,
  });
});
router.get("/profile-setting", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const Lname = user.pat_Lastname;
  const email = user.pat_Email;
  const lastName = user.pat_Lastname;
  const Ins = user.pat_InsuranceNo;
  res.render("Profile.ejs", {
    name: name,
    email: email,
    lastName: lastName,
    Ins: Ins,
  });
});
///------------------------------------logOut start--------------------------------------------------------
router.get("/logOut", authorization, (req, res) => {
  return res.clearCookie("accessToken").redirect("/");
});
//------------------------------------logOut end--------------------------------------------------------
router.get("/Ticket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  try {
    const tickets = new ticket({
      ticket_details: ticket_details,
      pat_id: id,
    });
    const savedTicket = await tickets.save();
    console.log(ticket);
  } catch (err) {
    res.render("Ticket.ejs", {
      name: name,
      errorMessage: "Something is missing1",
    });
  }
  try {
    const savedTicket = await Newticket.save();
    console.log(Newticket);
    res.render("Ticket.ejs", {
      name: name,
      errorMessage: "Something is missing2",
    });
  } catch (err) {
    console.log(err);
  }

  res.render("Ticket.ejs", {
    name: name,
    errorMessage: "Something is missing3",
  });
});
router.get("/profile-home", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  res.render("patienthome.ejs", { name: name, email: email });
});
//---------------------------------v
router.get("/viewdocschedule", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  res.render("viewDocSche.ejs", { name: name, email: email });
});
router.get("/viewappoint", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  res.render("viewAppoint.ejs", { name: name, email: email });
});
module.exports = router;
