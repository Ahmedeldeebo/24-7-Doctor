const router = require("express").Router();
const User = require("../models/Patient");
const Doctor = require("../models/Doctor");
const ticket = require("../models/Ticket");
const Appo = require("../models/Aappointment");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
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
    console.log(NewUser, "savedUser");
  } catch (e) {
    console.log(e.message, "error");
    res.render("signUp.ejs", {
      errorMessage: "Credentials already in use",
    });
  }
  try {
    //  const savedUser = await NewUser.save();
    //  console.log(NewUser);

    res.render("signIn.ejs", { Message: "Account Created Successfully" });
  } catch (e) {
    console.log(e.message);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ Pat_username: req.body.Pat_username });
    !user &&
      res.render("signIn.ejs", { Message: "", errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.pat_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.pat_password &&
      res.render("signIn.ejs", { Message: "", errorMessage: "Wrong password" });
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
      .render("./Patient/Patienthome.ejs", { Message: "", name: name });

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
// router.put("/profile-setting-Update", authorization, async (req, res, next) => {
//   console.log(res.locals.user.id);
//   const id = res.locals.user.id;
//   const user = await User.findById(id);
//   console.log(user);
//   const name = user.pat_FirstName;
//   const email = user.pat_Email;
//   const lastName = user.pat_Lastname;
//   const Ins = user.pat_InsuranceNo;
//   try {
//     const upadateUser = await User.findByIdAndUpdate(
//       id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.render("Profile.ejs");
//   } catch (err) {
//     console.log(err);
//     res.render("Profile.ejs");
//   }
//   res.render("Profile.ejs", {
//     name: name,
//     email: email,
//     lastName: lastName,
//     Ins: Ins,
//   });
// });
router.get("/profile-setting", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  const lastName = user.pat_Lastname;
  const Ins = user.pat_InsuranceNo;
  res.render("./Patient/Profile.ejs", {
    Message: "",
    errorMessage: "",
    name: name,
    email: email,
    lastName: lastName,
    Ins: Ins,
  });
});
router.post(
  "/profile-setting-update",
  authorization,
  async (req, res, next) => {
    console.log(res.locals.user.id);
    const id = res.locals.user.id;
    const user = await User.findById(id);
    console.log(user);
    const name = user.pat_FirstName;
    const email = user.pat_Email;
    const lastName = user.pat_Lastname;
    const Ins = user.pat_InsuranceNo;
    try {
      const updateUser = await User.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      );
      // res.render("./Patient/Profile.ejs", {
      //   Message: "Update Succ",
      //   errorMessage: "",
      //   name: name,
      //   email: email,
      //   lastName: lastName,
      //   Ins: Ins,
      // });
      console.log("Upadet scc");
      res.redirect("/patient/profile-setting");
    } catch (err) {
      console.log(err);
      // res.render("./Patient/Profile.ejs", {
      //   Message: "",
      //   errorMessage: "Falid to update",
      //   name: name,
      //   email: email,
      //   lastName: lastName,
      //   Ins: Ins,
      // });
      res.redirect("/patient/profile-setting");
    }

    console.log("Upadet scc");
    // const user = await User.findById(id);
    // console.log(user);
    // const name = user.pat_FirstName;
    // const email = user.pat_Email;
    // const lastName = user.pat_Lastname;
    // const Ins = user.pat_InsuranceNo;
    res.render("./Patient/Profile.ejs", {
      Message: "",
      errorMessage: "",
      name: name,
      email: email,
      lastName: lastName,
      Ins: Ins,
    });
  }
);
///------------------------------------logOut start--------------------------------------------------------
router.get("/logOut", authorization, (req, res) => {
  console.log("LogOut Successful");
  return res.clearCookie("accessToken").redirect("/");
});
//------------------------------------logOut end--------------------------------------------------------
//------------------------------------Start Tikcet --------------------------------------------------------
router.get("/Ticket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  res.render("./Patient/Ticket.ejs", {
    name: name,
    errorMessage: "",
  });
});
router.post("/Ticket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  try {
    const NewTicket = new ticket({
      ticket_Name: req.body.ticket_Name,
      ticket_Email: req.body.ticket_Email,
      ticket_details: req.body.ticket_details,
      pat_id: id,
    });
    const savedTikcet = await NewTicket.save();
    console.log(NewTicket);
  } catch (e) {
    console.log(e.masssage);
    res.render("./Patient/Ticket.ejs", {
      name: name,
      errorMessage: "Something is missing",
    });
  }
  res.render("./Patient/Ticket.ejs", {
    name: name,
    errorMessage: "Submite",
  });
});
//------------------------------------End Tikcet --------------------------------------------------------

router.get("/profile-home", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  res.render("./Patient/Patienthome.ejs", { name: name, email: email });
});
// Patient Profile Updating
router.get("/Profile-Edit", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  const lastName = user.pat_Lastname;
  res.render("./Patient/ProfileEdit.ejs", {
    name: name,
    email: email,
    lastName: lastName,
  });
});
//---------------------------------v
// router.get("/viewdocschedule", authorization, async (req, res) => {
//   const id = res.locals.user.id;
//   const user = await User.findById(id);
//   console.log(user);
//   const name = user.pat_FirstName;
//   const email = user.pat_Email;
//   res.render("./Patient/viewDocSche.ejs", { name: name, email: email });
// });
router.get("/viewappoint", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  res.render("./Patient/viewAppoint.ejs", { name: name, email: email });
});
//-----------------------------Start Booking Appoint---------------------------------------------------------
router.post("/booking", authorization, async (req, res) => {
  const DocId = req.body.Doc_Id;
  const body = req.body;
  console.log(DocId, "DocId");
  const id = res.locals.user.id;
  console.log(id);
  const user = await User.findById(id);
  const name = user.pat_FirstName;

  try {
    const NewAppoinemt = new Appo({
      App_visit_date: body.App_visit_date,
      App_visit_day: body.App_visit_day,
      App_RegVisit_time: body.App_RegVisit_time,
      Methed_of_comm: body.Methed_of_comm,
      Doc_Id: DocId,
      Pat_Id: id,
    });
    const SavdAppoinemt = await NewAppoinemt.save();
    console.log(Appo, "Create successfully");
  } catch (e) {
    console.log(e.message);
  }
  res.render("./Patient/booking.ejs", { user: user, name: name });
});
// router.get("/booking", authorization, async (req, res) => {
//   const id = res.locals.user.id;
//   console.log(id);
//   const user = await User.findById(id);
//   res.render("./Patient/booking.ejs", { user: user });
// });
//-----------------------------End Booking Appoint--------------------------------------------------------------
module.exports = router;
