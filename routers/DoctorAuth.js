const router = require("express").Router();
const Patient = require("../models/Patient");
const User = require("../models/Doctor");
const DocSche = require("../models/Doc_Schedule");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { render } = require("ejs");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  authorization,
} = require("./verifyToken");
const cors = require("cors");
const { body } = require("express-validator");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

router.post("/Doctor-register", async (req, res) => {
  console.log(req.body);
  try {
    const NewUser = new User({
      Doc_username: req.body.Doc_username,
      Doc_FirstName: req.body.Doc_FirstName,
      Doc_Lastname: req.body.Doc_Lastname,
      Doc_Email: req.body.Doc_Email,
      Doc_Gender: req.body.Doc_Gender,
      Doc_password: CryptoJS.AES.encrypt(
        req.body.Doc_password,
        process.env.PASS_SEC
      ).toString(),
      Specialization_Name: req.body.Specialization_Name,
      Doc_birtday: req.body.Doc_birtday,
    });
    const savedUser = await NewUser.save();
    console.log(NewUser);
  } catch (err) {
    res.render("signUp.ejs", { errorMessage: "Credentials already in use" });
  }
  try {
    // const savedUser = await NewUser.save();
    // console.log(NewUser);
    res.render("signInDoc.ejs", { errorMessage: "Account Created Successfully" });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/Docter-login", async (req, res) => {
  try {
    const user = await User.findOne({ Doc_username: req.body.Doc_username });
    !user && res.render("signInDoc.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.Doc_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.Doc_password &&
      res.render("signInDoc.ejs", { errorMessage: "Wrong password" });
    // res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      {
        expiresIn: "3d",
      }
    );

    // const { Doc_password, ...others } = user._doc;
    const name = user.Doc_FirstName;
    console.log(accessToken);
    console.log(name);

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .render("DocHomePage.ejs", { name: name }); //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});
//--------------------------------------------Start serc---------------------------------------------------
router.get("/doctorview", authorization, async (req, res) => {
  const body = req.body;
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  // const shce = await DocSche.find({ Doctor_id });
  // const fees = shce.Upfront_fees;
  // const time = shce.AveWating_Time;
  // const methods = shce.Available_methods;
  console.log(req.body);
  const users = await User.find({});
  console.log(users);
  res.render("doctorview.ejs", {
    users: users,
    name: name,
    // fees: fees,
    // time: time,
    // methods: methods,
  });
});
router.get("/doctorview-doc", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Doc_FirstName;
  // const shce = await DocSche.findById({ idSch: req.body.Doctor_id });
  // const test = await DocSche.findById(shce);
  // const fees = test.Upfront_fees;
  // const time = test.AveWating_Time;
  // const methods = test.Available_methods;
  console.log(req.body);
  const users = await User.find({});
  console.log(users);
  res.render("docDoctorview.ejs", {
    users: users,
    name: name,
    // fees: fees,
    // time: time,
    // methods: methods,
  });
});
//-------------------------------------------- Start profile Doc ---------------------------------------------------
router.get("/Doctor-profile-setting", authorization, async (req, res) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  const Lname = user.Doc_Lastname
  res.render("DocProfile.ejs", { name: name, email: email, Lname: Lname });
});
//-------------------------------------------- End Profile Doc ---------------------------------------------------
router.get("/profile-home-doc", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("DocHomePage.ejs", { name: name, email: email });
});
router.get("/updataShcdeule", authorization, async (req, res) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("DocSche.ejs", { name: name, email: email });
});
router.post("/UpdateSchedule-add", authorization, async (req, res) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  try {
    const UpdateDoc = new DocSche({
      Meeting_Maximum_Patient: req.body.Meeting_Maximum_Patient,
      Start_Time: req.body.Start_Time,
      AveWating_Time: req.body.AveWating_Time,
      Available_Days: req.body.Available_Days,
      Doctor_Date: req.body.Doctor_Date,
      Upfront_fees: req.body.Upfront_fees,
      Available_methods: req.body.Available_methods,
      Doctor_id: id,
    });
    const SavadUpdateDoc = await UpdateDoc.save();
    console.log(UpdateDoc);
  } catch (err) {
    console.log(err);
  }

  res.render("DocSche.ejs", { name: name, email: email });
});
module.exports = router;
