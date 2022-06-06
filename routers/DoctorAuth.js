const router = require("express").Router();
const Patient = require("../models/Patient");
const User = require("../models/Doctor");
const Appo = require("../models/Aappointment");
const DocSche = require("../models/Doc_Schedule");
const ticket = require("../models/Ticket");
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
    res.render("./Doc/DocSignup.ejs", { errorMessage: "Something is missing" });
  }

  try {
    const savedUser = await NewUser.save();
    console.log(NewUser);
  } catch (err) {
    res.render("./Doc/signInDoc.ejs", {
      errorMessage: "Account Created Successfully",
    });
  }
  try {
    // const savedUser = await NewUser.save();
    // console.log(NewUser);
    res.render("signIn.ejs", {
      errorMessage: "Credentials already in use",
    });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/Docter-login", async (req, res) => {
  try {
    const user = await User.findOne({ Doc_username: req.body.Doc_username });
    !user && res.render("./Doc/signInDoc.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.Doc_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.Doc_password &&
      res.render("./Doc/signInDoc.ejs", { errorMessage: "Wrong password" });
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
      .render("./Doc/DocHomePage.ejs", { name: name }); //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});
//--------------------------------------------Start view---------------------------------------------------
router.get("/doctorview", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const Sch = await DocSche.find({}).populate("Doctor_id");
  console.log(Sch);
  res.render("doctorview.ejs", {
    Sch: Sch,
    name: name,
  });
});
router.post("/doctorview-filter", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const SpecName = req.body.SpecName;
  const Sch = await DocSche.find({}).populate({
    path: "Doctor_id",
    match: { Specialization_Name: SpecName },
  });

  console.log(Sch);
  console.log(SpecName);
  // res.send(Sch);
  res.render("doctorview.ejs", {
    Sch: Sch,
    name: name,
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
  res.render("./Doc/docDoctorview.ejs", {
    users: users,
    name: name,
    // fees: fees,
    // time: time,
    // methods: methods,
  });
});
//--------------------------------------------End view---------------------------------------------------
//-------------------------------------------- Start profile Doc ---------------------------------------------------
router.get("/Doctor-profile-setting", authorization, async (req, res) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  const Lname = user.Doc_Lastname;
  res.render("./Doc/DocProfile.ejs", {
    name: name,
    email: email,
    Lname: Lname,
  });
});
//-------------------------------------------- End Profile Doc ---------------------------------------------------
//------------------------------------Start Tikcet --------------------------------------------------------
router.get("/DocTicket", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("./Doc/DocTicket.ejs", {
    name: name,
    email: email,
    errorMessage: "",
  });
});
router.post("/DocTicket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  try {
    const NewTicket = new ticket({
      ticket_Name: req.body.ticket_Name,
      ticket_Email: req.body.ticket_Email,
      ticket_details: req.body.ticket_details,
      Doc_id: id,
    });
    const savedTikcet = await NewTicket.save();
    console.log(NewTicket);
  } catch (e) {
    console.log(e.masssage);
    res.render("./Doc/DocTicket.ejs", {
      name: name,
      errorMessage: "Something is missing",
    });
  }
  res.render("./Doc/DocTicket.ejs", {
    name: name,
    errorMessage: "Submite",
  });
});
//------------------------------------End Tikcet --------------------------------------------------------

router.get("/ManageAppointments", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  const appo = await Appo.find({ Doc_Id: id }).populate("Doc_Id");
  console.log(user);
  console.log(appo);

  res.render("./Doc/DocMangApp.ejs", { name: name, appo: appo });
});
router.get("/DocProfileEdit", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  const Lname = user.Doc_Lastname;
  res.render("./Doc/DocProfileEdit.ejs", {
    name: name,
    email: email,
    Lname: Lname,
  });
});
router.get("/profile-home-doc", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("./Doc/DocHomePage.ejs", { name: name, email: email });
});
//------------------------Start Doc Shcdeule--------------------------------------------------------------
router.get("/updataShcdeule", authorization, async (req, res) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("./Doc/DocSche.ejs", { name: name, email: email });
});
router.post("/UpdateSchedule", authorization, async (req, res) => {
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
  } catch (e) {
    console.log(e.masssage);
  }

  res.render("./Doc/DocSche.ejs", { name: name, email: email });
});
//-------------------------------------------End Doc Shcdeule--------------------------------------------------------------
//-------------------------------------------- Start view Doc ---------------------------------------------------
router.post("/viewDocSch", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const DocID = req.body.Doc_Id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const shce = await DocSche.findOne({ Doctor_id: DocID });
  const DocUser = await User.findById(DocID);
  // console.log(shce);
  // console.log(DocUser);
  // console.log(req.body.Doc_Id);
  // console.log(DocID);
  // console.log(id);
  res.render("./Patient/viewDocSche.ejs", {
    DocUser: DocUser,
    shce: shce,
    name: name,
  });
});
//-------------------------------------------- End view Doc ---------------------------------------------------
//-------------------------------------------- Start Doc Search ---------------------------------------------------
router.post("/DocSearch", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const DocName = req.body.DocName;
  const doc = await User.find({ Doc_FirstName: DocName });
  console.log(DocName);
  console.log(doc);
  res.send(doc);
});
//-------------------------------------------- End Doc Search ---------------------------------------------------
module.exports = router;
