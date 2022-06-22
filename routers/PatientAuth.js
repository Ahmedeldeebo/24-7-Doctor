const router = require("express").Router();
const User = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Pharmacy = require("../models/Pharmacy");
const shcdeule = require("../models/Doc_Schedule");
const ticket = require("../models/Ticket");
const Bill = require("../models/Bill");
const Appo = require("../models/Aappointment");
const payment = require("../models/Payment");
const Prescription = require("../models/Prescription");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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
const { findById, count } = require("../models/Patient");
const { check } = require("prettier");

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

    res.render("signIn.ejs", {
      errorMessage: "",
      Message: "Account Created Successfully",
    });
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
      res.render("signIn.ejs", { errorMessage: "Wrong username", Message: "" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.pat_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.pat_password &&
      res.render("signIn.ejs", { errorMessage: "Wrong password", Message: "" });
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
      .redirect("/patient/profile-home");

    //res.status(200).json({ ...others, accessToken });
  } catch (e) {
    return console.log(e.message);
  }
});
//-------------------------------------------- End Login ---------------------------------------------------
//-------------------------------------------- Start  profile ---------------------------------------------------
router.get("/profile-setting", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  console.log(user);
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  res.render("./Patient/Profile.ejs", {
    user: user,
    name: name,
    appo: appo,
    number: number,
    result: result,
    errorMessage: "",
  });
});
router.post("/Profile-Edit", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.pat_FirstName;

  console.log(user);
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.redirect("/patient/profile-setting");
  } catch (e) {
    console.log(e.message);

    res.redirect("/patient/profile-setting");
  }
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/Profile.ejs", {
    name: name,
    user: user,
    appo: appo,
    number: number,
    result: result,
  });
});
// Patient Profile Updating
router.get("/Profile-Edit", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  res.render("./Patient/ProfileEdit.ejs", {
    name: name,
    user: user,
    appo: appo,
    number: number,
    result: result,
  });
});
/// home page
router.get("/profile-home", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  const email = user.pat_Email;
  const countUser = await User.countDocuments({});
  console.log("User " + countUser);
  const countPhar = await Pharmacy.countDocuments({});
  console.log("Pharmacy " + countPhar);
  const countDoc = await Doctor.countDocuments({});
  console.log("Doctors " + countDoc);
  //--Notification
  // nodeMail transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  let checkUpListt = await Prescription.find({
    Pat_Id: id,
  }).sort({
    _id: -1,
  });
  let checkUpListtt = await Prescription.findOne({
    Pat_Id: id,
  })
    .sort({
      _id: -1,
    })
    .populate("Doc_Id");
  const checkDayUpdate = checkUpListtt.CheckUpDay.toDateString();
  const date = new Date();
  const dataStr = date.toDateString();
  const resultt = checkUpListt.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );
  let masgEmail = {
    from: `"Doctor 24/7" <${process.env.MAIL_USER}`, // sender address
    to: `${email}`, // list of receivers
    //to: "davidlotfy123@gmail.com",
    subject: "Ckeck Up Reminder", // Subject line
    // text: "You need to ckeck Up with your Doctor",
    html: `<h2 style=" text-transform: capitalize">Hello ${name}!</h2>
        <h4>You need to ckeck Up with your Doctor</h4>
        <p  style=" text-transform: capitalize">Doctor Name: Dr.<b>${
          checkUpListtt.Doc_Id.Doc_FirstName
        }</b></p>
        <p>Ckeck Up Date: <b>${checkUpListtt.CheckUpDay.toDateString()}</b></p>
        <p>Have a nice day!</p>`, // plain text body
    // send mail with defined transport object
  };

  if (checkDayUpdate === dataStr) {
    console.log("checkUpDay is = to today");
    transporter.sendMail(masgEmail, (err, data) => {
      if (err) {
        res.status(400).send(err);
      } else res.send(`Email Sent: ${data}`);
    });
  } else {
    console.log("not equle");
    // transporter.sendMail(masgEmail, (err, data) => {
    //   if (err) {
    //     res.status(400).send(err);
    //   } else res.send(`Email Sent: ${data}`);
    // });
  }

  // const date = new Date();
  // const dataStr = date.toDateString();
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  res.render("./Patient/Patienthome.ejs", {
    name: name,
    number: number,
    appo: appo,
    userCont: countUser,
    Phar: countPhar,
    Doc: countDoc,
    result: result,
  });
});

///------------------------------------End fo profile--------------------------------------------------------
//------------------------------------Start Tikcet --------------------------------------------------------
router.get("/Ticket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/Ticket.ejs", {
    name: name,
    errorMessage: "",
    number: number,
    appo: appo,
    result: result,
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
      Pat_Id: id,
    });
    const savedTikcet = await NewTicket.save();
    console.log(NewTicket);
  } catch (e) {
    console.log(e.message);
    res.render("./Patient/Ticket.ejs", {
      name: name,
      errorMessage: "Something is missing",
      number: number,
      appo: appo,
    });
  }
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/Ticket.ejs", {
    name: name,
    errorMessage: "Ticket Sent Successfully",
    number: number,
    appo: appo,
    result: result,
  });
});

//------------------------------------End Tikcet --------------------------------------------------------
//------------------------------------Start view Appo --------------------------------------------------------
router.get("/viewappoint", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const appoo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 });
  console.log(user);
  console.log(appoo);
  const name = user.pat_FirstName;
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/viewAppoint.ejs", {
    name: name,
    appoo: appoo,
    appo: appo,
    number: number,
    result: result,
  });
});
router.post("/viewappoint", authorization, async (req, res) => {
  const id = res.locals.user.id;
  // const DocId = req.body.Doc_Id;
  const user = await User.findById(id);
  const name = user.pat_FirstName;

  const AppooId = req.body.Appo_Id;
  const appoo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 });
  // console.log(user);
  // console.log(appoo);

  console.log(AppooId + " Appo_Id");
  const appoDetails = await Appo.findById(AppooId)
    .populate("Pat_Id")
    .populate("Doc_Id");
  //  console.log(appoDetails);

  //--Notification
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });
  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );
  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  // res.redirect("/patient/AppDetails");
  res.render("./Patient/PatAppDetails.ejs", {
    name: name,
    appoo: appoo,
    appo: appo,
    appooo: appoDetails,
    number: number,
    result: result,
  });
});
//-----------------------------End view Appo---------------------------------------------------------
//-----------------------------Start Booking Appo---------------------------------------------------------
router.post("/booking", authorization, async (req, res) => {
  const DocId = req.body.Doc_Id;
  console.log(DocId);
  const id = res.locals.user.id;
  console.log(id);
  const user = await User.findById(id);
  const Doc = await Doctor.findById(DocId);
  const docSchedule = await shcdeule.find({ Doctor_id: DocId });
  console.log(Doc, "Doc Table");
  const name = user.pat_FirstName;

  //let d = new Date('01-06-2022')
  // day = ""
  // for (item in list){
  //     if(item === 1)
  //       day = "Sunday"
  //     else
  //         day = "Monday"

  // let Available_Days = [a, a, a, a];
  // let availableStringDays = [];
  // for (day in available_days) {
  //   // dateObject = new Date(day);
  //   // day = dateObject.getDay();
  //   if (day === 0)
  //   availableStringDays.push("Sunday");
  //   else
  //   availableStringDays.push("Monday");
  // }

  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  res.render("./Patient/booking.ejs", {
    user: user,
    name: name,
    Doc: Doc,
    number: number,
    appo: appo,
    result: result,
    Sche: docSchedule,
  });
});
router.post("/booking-Create", authorization, async (req, res) => {
  const body = req.body;
  const DocId = req.body.Doc_Id;
  console.log(DocId);
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
    const pat_perDay = await shcdeule.findOne({ Doctor_id: DocId });
    console.log(pat_perDay.Meeting_Maximum_Patient + " old");
    const update = await shcdeule.findByIdAndUpdate(pat_perDay._id, {
      Meeting_Maximum_Patient: pat_perDay.Meeting_Maximum_Patient - 1,
    });
    console.log(Appo, SavdAppoinemt, "Create successfully");
  } catch (e) {
    console.log(e.message);
  }
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.redirect("/patient/viewappoint");
});

//-----------------------------End Booking Appo--------------------------------------------------------------
//-----------------------------Start AppDetails--------------------------------------------------------------
router.get("/AppDetails", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/PatAppDetails.ejs", {
    name: name,
    errorMessage: "",
    number: number,
    appo: appo,
    result: result,
  });
});
//-----------------------------End AppDetails--------------------------------------------------------------
//-----------------------------Start AppDetails--------------------------------------------------------------
// router.get("/ViewPrescription", authorization, async (req, res) => {
//   const id = res.locals.user.id;
//   const user = await User.findById(id);
//   console.log(user);
//   const name = user.pat_FirstName;
//   //--Notification
//   const appo = await Appo.find({ Pat_Id: id })
//     .populate("Pat_Id")
//     .populate("Doc_Id")
//     .sort({ _id: -1 })
//     .limit(5);
//   const query = Appo.find({ Pat_Id: id });
//   query.count(function (err, count) {
//     if (err) console.log(err);
//     else console.log("Count is", count);
//     const number = count;
//     res.render("./Patient/ViewPres.ejs", {
//       name: name,
//       errorMessage: "",
//       number: number,
//       appo: appo,
//     });
//   });
// });
router.post("/ViewPrescription", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const ApppId = req.body.Appo_Id;
  console.log("App Id " + ApppId);
  const appoDetails = await Appo.findById(ApppId)
    .populate("Pat_Id")
    .populate("Doc_Id");
  console.log(appoDetails);
  const user = await User.findById(id);
  console.log(user);
  const name = user.pat_FirstName;

  const PresDesc = await Prescription.findOne({
    Appoinment_Id: ApppId,
  })
    .populate("Pat_Id")
    .populate("Doc_Id");
  console.log(PresDesc);
  if (PresDesc === null) {
    //--Notification

    const checkUpList = await Prescription.find({
      Pat_Id: id,
    });

    const date = new Date();
    const dataStr = date.toDateString();
    const result = checkUpList.filter(
      (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
    );

    const appo = await Appo.find({ Pat_Id: id })
      .populate("Pat_Id")
      .populate("Doc_Id")
      .sort({ _id: -1 })
      .limit(5);
    const number = await Appo.countDocuments({ Pat_Id: id });
    console.log(number);
    res.render("./Patient/viewPresNull.ejs", {
      name: name,
      pres: PresDesc,
      errorMessage: "",
      number: number,
      appo: appo,
      result: result,
      appoo: appoDetails,
    });
  } else {
    //--Notification

    const checkUpList = await Prescription.find({
      Pat_Id: id,
    });

    const date = new Date();
    const dataStr = date.toDateString();
    const result = checkUpList.filter(
      (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
    );

    const appo = await Appo.find({ Pat_Id: id })
      .populate("Pat_Id")
      .populate("Doc_Id")
      .sort({ _id: -1 })
      .limit(5);
    const number = await Appo.countDocuments({ Pat_Id: id });
    console.log(number);
    res.render("./Patient/ViewPres.ejs", {
      name: name,
      pres: PresDesc,
      errorMessage: "",
      number: number,
      appo: appo,
      result: result,
      appoo: appoDetails,
    });
  }

  // //--Notification

  // const checkUpList = await Prescription.find({
  //   Pat_Id: id,
  // });

  // const date = new Date();
  // const dataStr = date.toDateString();
  // const result = checkUpList.filter(
  //   (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  // );

  // const appo = await Appo.find({ Pat_Id: id })
  //   .populate("Pat_Id")
  //   .populate("Doc_Id")
  //   .sort({ _id: -1 })
  //   .limit(5);
  // const number = await Appo.countDocuments({ Pat_Id: id });
  // console.log(number);
  // res.render("./Patient/ViewPres.ejs", {
  //   name: name,
  //   pres: PresDesc,
  //   errorMessage: "",
  //   number: number,
  //   appo: appo,
  //   result: result,
  //   appoo: appoDetails,
  // });
});
//-----------------------------End AppDetails--------------------------------------------------------------
//----------------------------- Start Notification--------------------------------------------------------------
router.get("/noificationSystem", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.deleteMany({});
  const name = user.pat_FirstName;
  //new

  // function WithoutTime(dateTime) {
  //   var date = new Date(dateTime.getTime());
  //   date.setHours(0, 0, 0, 0);
  //    date;

  let checkUpList = await Prescription.findOne({
    Pat_Id: id,
  }).sort({
    _id: -1,
  });
  let checkUpListt = await Prescription.find({
    Pat_Id: id,
  }).sort({
    _id: -1,
  });
  const datet = new Date();
  const dataStrt = datet.toDateString();
  const result = checkUpListt.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStrt
  );
  // console.log(result);
  // console.log(checkUpList);
  //
  // const dataStr =
  // const checkDay = checkUpList.CheckUpDay.toDateString();
  // if (checkDay === dataStr) {
  //   console.log("checkUpDay is = to today");
  //   const check = await Prescription.find({ Pat_Id: id })
  //     .sort({ _id: -1 })
  //     .limit(5);
  //   console.log(check);

  //   return check;
  // }
  // console.log(check);
  // const count = await Prescription.countDocuments({ Pat_Id: id });
  // console.log(count);

  //
  // console.log(checkUpList.CheckUpDay.getDay());
  //
  // const date = new Date();
  // console.log("test" + checkUpList);
  // const result = checkUpList.filter(
  //   (checkUp) => checkUpList.CheckUpDay.toDateString() === date.toDateString()
  //);
  //console.log(date.toDateString());
  const checkDayUpdate = checkUpList.CheckUpDay.toDateString();
  const date = new Date();
  const dataStr = date.toDateString();
  // console.log(new Date());
  const email = user.pat_Email;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });

  let masgEmail = {
    from: `"Onlin Doctore 24/7" <${process.env.MAIL_USER}`, // sender address
    to: `${email}`, // list of receivers
    //to: "davidlotfy123@gmail.com",
    subject: "you need to ckeck Up with your Doctor", // Subject line
    text: "you need to ckeck Up with your Doctor", // plain text body
    // send mail with defined transport object
  };
  if (checkDayUpdate === dataStr) {
    console.log("checkUpDay is = to today");
    const info = await transporter.sendMail(masgEmail);
  } else {
    console.log("not equle");
    transporter.sendMail(masgEmail, (err, data) => {
      if (err) {
        res.status(400).send(err);
      } else res.send(`Email Sent: ${data}`);
    });

    // console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  //new
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./partials/navHome.ejs", {
    number: number,
    name: name,
    appo: appo,
    result: result,
  });
});

//----------------------------- End Notification--------------------------------------------------------------

//-----------------------------Start View bills--------------------------------------------------------------
router.post("/ViewBill", authorization, async (req, res, next) => {
  const id = res.locals.user.id;
  const appo_Id = req.body.Appo_Id;
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  const appoo = await Appo.findById(appo_Id)
    .populate("Pat_Id")
    .populate("Doc_Id");

  const appoBill = await Bill.findOne({ Appoinment_Id: appo_Id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .populate("Appoinment_Id");
  // console.log(appoBill);
  if (appoBill === null) {
    //--Notification

    const checkUpList = await Prescription.find({
      Pat_Id: id,
    });

    const date = new Date();
    const dataStr = date.toDateString();
    const result = checkUpList.filter(
      (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
    );

    // console.log(result);
    const appo = await Appo.find({ Pat_Id: id })
      .populate("Pat_Id")
      .populate("Doc_Id")
      .sort({ _id: -1 })
      .limit(5);
    const number = await Appo.countDocuments({ Pat_Id: id });
    console.log(number);
    res.render("./Patient/ViewBillNull.ejs", {
      name: name,
      number: number,
      appo: appo,
      appoo: appoo,
      errorMessage: "",
      Message: "",
      result: result,
      bill: appoBill,
    });
  } else {
    //--Notification

    const checkUpList = await Prescription.find({
      Pat_Id: id,
    });

    const date = new Date();
    const dataStr = date.toDateString();
    const result = checkUpList.filter(
      (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
    );

    // console.log(result);
    const appo = await Appo.find({ Pat_Id: id })
      .populate("Pat_Id")
      .populate("Doc_Id")
      .sort({ _id: -1 })
      .limit(5);
    const number = await Appo.countDocuments({ Pat_Id: id });
    console.log(number);
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "",
      Message: "",
      result: result,
      bill: appoBill,
    });
  }
});
// router.get("/ViewBill", authorization, async (req, res) => {
//   const id = res.locals.user.id;
//   const appo_Id = req.body.Appo_Id;
//   console.log(appo_Id);
//   const user = await User.findById(id);
//   const appoBill = await Bill.findOne({ Appoinment_Id: appo_Id })
//     .populate("Pat_Id")
//     .populate("Doc_id")
//     .populate("Appoinment_Id");
//   // console.log(appoBill);
//   // console.log(user);
//   const name = user.pat_FirstName;
//   //--Notification

//   const checkUpList = await Prescription.find({
//     Pat_Id: id,
//   });

//   const date = new Date();
//   const dataStr = date.toDateString();
//   const result = checkUpList.filter(
//     (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
//   );

//   // console.log(result);
//   const appo = await Appo.find({ Pat_Id: id })
//     .populate("Pat_Id")
//     .populate("Doc_Id")
//     .sort({ _id: -1 })
//     .limit(5);
//   const number = await Appo.countDocuments({ Pat_Id: id });
//   console.log(number);
//   res.render("./Patient/ViewBill.ejs", {
//     name: name,
//     number: number,
//     appo: appo,
//     errorMessage: "",
//     result: result,
//     bill: appoBill,
//   });
// });

//-----------------------------End view bills--------------------------------------------------------------
//-----------------------------Start Payment Methods--------------------------------------------------------------
router.post("/payment-visa", authorization, async (req, res) => {
  const body = req.body;
  const id = res.locals.user.id;
  const BillId = body.BillId;
  console.log(BillId);
  const AppoId = body.AppoId;
  const DocId = body.DocId;
  const PayAmount = body.Bill_Amount;
  const appoBill = await Bill.findOne({ Appoinment_Id: AppoId })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .populate("Appoinment_Id");
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );
  try {
    const NewPayment = new payment({
      Pay_Amount: PayAmount,
      Pay_type: "Card",
      Pay_Card_Number: body.Pay_Card_Number,
      Pay_Card_Holder: body.Pay_Card_Holder,
      Pay_Card_expDate: body.Pay_Card_expDate,
      Bill_id: BillId,
      Pat_Id: id,
      Appoinment_Id: AppoId,
      Doc_id: DocId,
    });
    const SavedPayment = await NewPayment.save();
    console.log(NewPayment);
    const paymentStatusUpdate = await Bill.findByIdAndUpdate(BillId, {
      Bill_status: "Paid Successfully",
    });
    const AppoPaymentStatusUpdate = await Appo.findByIdAndUpdate(AppoId, {
      App_visit_status: "Paid Successfully",
    });
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "",
      Message: "Paid Successfully",
      result: result,
      bill: appoBill,
    });
  } catch (e) {
    console.log(e.message);
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "Failed",
      Message: "",
      result: result,
      bill: appoBill,
    });
  }
});
router.post("/payment-paypal", authorization, async (req, res) => {
  const body = req.body;
  const id = res.locals.user.id;
  const BillId = body.BillId;
  console.log(BillId);
  const AppoId = body.AppoId;
  const DocId = body.DocId;
  const PayAmount = body.Bill_Amount;
  const appoBill = await Bill.findOne({ Appoinment_Id: AppoId })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .populate("Appoinment_Id");
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );
  try {
    const NewPayment = new payment({
      Pay_Amount: PayAmount,
      Pay_type: "PayPal",
      Pay_PayPal_Email: body.Pay_PayPal_Email,
      Bill_id: BillId,
      Pat_Id: id,
      Appoinment_Id: AppoId,
      Doc_id: DocId,
    });
    const SavedPayment = await NewPayment.save();
    console.log(NewPayment);
    const paymentStatusUpdate = await Bill.findByIdAndUpdate(BillId, {
      Bill_status: "Paid Successfully",
    });
    const AppoPaymentStatusUpdate = await Appo.findByIdAndUpdate(AppoId, {
      App_visit_status: "Paid Successfully",
    });
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "",
      Message: "Paid Successfully",
      result: result,
      bill: appoBill,
    });
  } catch (e) {
    console.log(e.message);
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "Failed",
      Message: "",
      result: result,
      bill: appoBill,
    });
  }
});
router.post("/payment-vodcash", authorization, async (req, res) => {
  const body = req.body;
  const id = res.locals.user.id;
  const BillId = body.BillId;
  console.log(BillId);
  const AppoId = body.AppoId;
  const DocId = body.DocId;
  const PayAmount = body.Bill_Amount;
  const appoBill = await Bill.findOne({ Appoinment_Id: AppoId })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .populate("Appoinment_Id");
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );
  try {
    const NewPayment = new payment({
      Pay_Amount: PayAmount,
      Pay_type: "Vodafone Cash",
      Pay_VodCash_Number: body.Pay_VodCash_Number,
      Bill_id: BillId,
      Pat_Id: id,
      Appoinment_Id: AppoId,
      Doc_id: DocId,
    });
    const SavedPayment = await NewPayment.save();
    console.log(NewPayment);
    const paymentStatusUpdate = await Bill.findByIdAndUpdate(BillId, {
      Bill_status: "Paid Successfully",
    });
    const AppoPaymentStatusUpdate = await Appo.findByIdAndUpdate(AppoId, {
      App_visit_status: "Paid Successfully",
    });
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "",
      Message: "Paid Successfully",
      result: result,
      bill: appoBill,
    });
  } catch (e) {
    console.log(e.message);
    res.render("./Patient/ViewBill.ejs", {
      name: name,
      number: number,
      appo: appo,
      errorMessage: "Failed",
      Message: "",
      result: result,
      bill: appoBill,
    });
  }
});
//-----------------------------Start Payment Methods--------------------------------------------------------------
//-----------------------------Start Notification Method--------------------------------------------------------------
router.post("/notification-details", authorization, async (res, req) => {
  const id = res.locals.user.id;
  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);
  const appoDetails = await Appo.findById(AppooId)
    .populate("Pat_Id")
    .populate("Doc_Id");
  res.redirect("/patient/viewappoint");
});

//-----------------------------End Notification Method--------------------------------------------------------------

///------------------------------------Start Prescription History--------------------------------------------------------
router.get("/PresHistory", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.pat_FirstName;
  const history = await Prescription.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 });
  // console.log(history);
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_Id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const result = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(result);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("./Patient/PresHistory.ejs", {
    name: name,
    number: number,
    appo: appo,
    errorMessage: "",
    Message: "",
    result: result,
    prse: history,
  });
});
//------------------------------------End Prescription History--------------------------------------------------------
module.exports = router;
