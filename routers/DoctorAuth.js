const router = require("express").Router();
const Patient = require("../models/Patient");
const Pharmacy = require("../models/Pharmacy");
const Meet_Link = require("../models/Meet_Link");
const User = require("../models/Doctor");
const Appo = require("../models/Aappointment");
const DocSche = require("../models/Doc_Schedule");
const ticket = require("../models/Ticket");
const bill = require("../models/Bill");
const nodemailer = require("nodemailer");
const Prescription = require("../models/Prescription");
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

// router.use(cors({ origin: "*", credentials:true  } ) );

//--------------------------------------------Register--------------------------------------------

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
    // const id = NewUser._id;
    const id = encodeURIComponent(NewUser._id);
    console.log(id);
    return res
      .cookie("id", id, {
        httpOnly: true,
      })
      .redirect("/doctor/SetDocSche");
  } catch (e) {
    console.log(e.message);
    res.render("./Doc/DocSignup.ejs", { errorMessage: "Something is missing" });
  }
});
///------------------------------------Start Doctor Sechduel Set Up-------------------------------------------------------
router.get("/SetDocSche", (req, res) => {
  res.render("./Doc/SetDocSche.ejs");
});
router.post("/SetDocSche", async (req, res) => {
  console.log(req.body);
  let id = req.headers.cookie;
  id = id.slice(3, id.length);
  console.log(id);
  const user = await User.findById(id);
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
    console.log(SavadUpdateDoc);
  } catch (e) {
    console.log(e.message);
  }
  res.clearCookie("id").render("./Doc/signInDoc.ejs", {
    errorMessage: "Account Created Successfully",
  });
});
//------------------------------------End Doctor Sechduel Set Up---------------------------------------------------------

//-------------------------------------------- End Register---------------------------------------------

//-------------------------------------------- Login ---------------------------------------------------
router.post("/Docter-login", async (req, res) => {
  try {
    const user = await User.findOne({ Doc_username: req.body.Doc_username });
    !user &&
      res.render("./Doc/signInDoc.ejs", { errorMessage: "Wrong username" });
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
      .redirect("/doctor/profile-home-doc"); //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});
router.get("/profile-home-doc", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  const countDoc = await User.countDocuments({});
  console.log("User " + countDoc);
  const countPhar = await Pharmacy.countDocuments({});
  console.log("Pharmacy " + countPhar);
  const countUser = await Patient.countDocuments({});
  console.log("Doctors " + countUser);
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocHomePage.ejs", {
    name: name,
    email: email,
    appo: appo,
    number: number,
    userCont: countUser,
    Phar: countPhar,
    Doc: countDoc,
  });
});
//--------------------------------------------Start view---------------------------------------------------
router.get("/doctorview", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const scheduleList = await DocSche.find({}).populate("Doctor_id");
  const result = scheduleList.filter((schedule) => schedule.Start_Time != "");
  //--Notification
  const checkUpList = await Prescription.find({
    Pat_id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const resultp = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(resultp);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  res.render("doctorview.ejs", {
    Sch: result,
    name: name,
    appo: appo,
    number: number,
    result: resultp,
  });
});

router.post("/doctorview", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const SpecName = req.body.SpecName;
  console.log(SpecName);

  let scheduleList = await DocSche.find()
    .populate("Doctor_id")
    .sort({ _id: -1 });
  const result = scheduleList.filter(
    (schedule) => schedule.Doctor_id.Specialization_Name === SpecName
    //&& schedule.Meeting_Maximum_Patient > 0
  );
  //--Notification

  const checkUpList = await Prescription.find({
    Pat_id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const resultp = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() === dataStr
  );

  // console.log(resultp);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  console.log(number);

  // console.log(result);
  // console.log(SpecName);
  // res.send(result);
  res.render("doctorview.ejs", {
    Sch: result,
    name: name,
    appo: appo,
    number: number,
    result: resultp,
  });
});

router.get("/doctorview-doc", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Doc_FirstName;
  let scheduleList = await DocSche.find()
    .populate("Doctor_id")
    .sort({ _id: -1 });
  const result = scheduleList.filter((schedule) => schedule.Start_Time != "");
  //&& schedule.Meeting_Maximum_Patient > 0
  // console.log(scheduleList);
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .limit(5)
    .sort({ _id: -1 });
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/docDoctorview.ejs", {
    users: result,
    name: name,
    appo: appo,
    number: number,
  });
});
router.post("/doctorview-doc", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Doc_FirstName;
  const SpecName = req.body.SpecName;
  let scheduleList = await DocSche.find()
    .populate("Doctor_id")
    .sort({ _id: -1 });
  const result = scheduleList.filter(
    (schedule) => schedule.Doctor_id.Specialization_Name === SpecName
    //&& schedule.Meeting_Maximum_Patient > 0
  );
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .limit(5)
    .sort({ _id: -1 });
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/docDoctorview.ejs", {
    users: result,
    name: name,
    appo: appo,
    number: number,
  });
});
//--------------------------------------------End view---------------------------------------------------
//-------------------------------------------- Start profile Doc ---------------------------------------------------
router.get("/Doctor-profile-setting", authorization, async (req, res) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocProfile.ejs", {
    name: name,
    user: user,
    appo: appo,
    number: number,
  });
});

//edit
router.get("/DocProfileEdit", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  // const email = user.Doc_Email;
  // const Lname = user.Doc_Lastname;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocProfileEdit.ejs", {
    name: name,
    user: user,
    appo: appo,
    number: number,
  });
});
router.post("/DocProfileEdit", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.redirect("/doctor/Doctor-profile-setting");
  } catch (e) {
    console.log(e.message);
  }
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocProfile.ejs", {
    name: name,
    user: user,
    appo: appo,
    number: number,
  });
});
//-------------------------------------------- End Profile Doc ---------------------------------------------------
//------------------------------------Start Tikcet --------------------------------------------------------
router.get("/DocTicket", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocTicket.ejs", {
    name: name,
    email: email,
    errorMessage: "",
    appo: appo,
    number: number,
  });
});
router.post("/DocTicket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
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
    console.log(e.message);
    res.render("./Doc/DocTicket.ejs", {
      name: name,
      errorMessage: "Something is missing",
    });
  }
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocTicket.ejs", {
    name: name,
    errorMessage: "Submite",
    appo: appo,
    number: number,
  });
});
//------------------------------------End Tikcet --------------------------------------------------------
//------------------------Start Doc Shcdeule--------------------------------------------------------------
router.get("/updataShcdeule", authorization, async (req, res) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .limit(5)
    .sort({ _id: -1 });
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocSche.ejs", {
    name: name,
    email: email,
    appo: appo,
    number: number,
  });
});
router.post("/UpdateSchedule", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  try {
    const updateDocSche = await DocSche.findOneAndUpdate(
      { Doctor_id: id },
      {
        $set: req.body,
      },
      { new: true }
    );
    console.log(updateDocSche);
  } catch (e) {
    console.log(e.message);

    res.redirect("/doctor/UpdateSchedule");
  }
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocSche.ejs", {
    name: name,
    email: email,
    appo: appo,
    number: number,
  });
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
  const checkUpList = await Prescription.find({
    Pat_id: id,
  });

  const date = new Date();
  const dataStr = date.toDateString();
  const resultp = checkUpList.filter(
    (checkUp) => checkUp.CheckUpDay.toDateString() <= dataStr
  );

  // console.log(resultp);
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Pat_Id: id });
  // console.log(number);
  // console.log(number);
  // console.log(user);
  // console.log(appo);

  res.render("./Patient/viewDocSche.ejs", {
    DocUser: DocUser,
    shce: shce,
    name: name,
    number: number,
    appo: appo,
    result: resultp,
  });
});

//-------------------------------------------- End view Doc ---------------------------------------------------
//-------------------------------------------- Start Doc Search ---------------------------------------------------
router.post("/DocSearch-patient", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const DocName = req.body.DocName;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  try {
    const DocUser = await User.find({ Doc_FirstName: DocName });
    const scheduleList = await DocSche.findOne({
      Doc_FirstName: DocName,
    }).populate("Doctor_id");

    // console.log(shce);
    // console.log(docName);
    // console.log(docId);
    res.render("./Patient/DocSearch.ejs", {
      name: name,
      Sch: DocUser,
    });
  } catch (e) {
    console.log(e.message);
    res.render("search.ejs");
  }
});

router.post("/DocSearch", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const DocName = req.body.DocName;
  const user = await User.findById(id);
  const name = user.Doc_FirstName;
  try {
    const docName = await User.findOne({ Doc_FirstName: DocName });
    const docId = docName._id;
    const Doc = await User.findById(docId);
    const shce = await DocSche.findOne({ Doctor_id: docId }).populate(
      "Doctor_id"
    );
    // console.log(shce);
    // console.log(docName);
    // console.log(docId);
    res.render("./Patient/DocSearch.ejs", { Doc: Doc, name: name, shce: shce });
  } catch (e) {
    console.log(e.message);
    res.render("search.ejs");
  }
});

//-------------------------------------------- End Doc Search ---------------------------------------------------
//-------------------------------------------- Start Doctor AppDetails---------------------------------------------------
router.get("/ManageAppointments", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  // const email = user.Doc_Email;
  const appoo = await Appo.find({ Doc_Id: id })
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .populate("Pat_Id");
  // console.log(user);
  // console.log(appoo);
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);

  res.render("./Doc/DocMangApp.ejs", {
    name: name,
    appoo: appoo,
    appo: appo,
    number: number,
  });
});

// router.get("/AppDetails", authorization, async (req, res, next) => {
//   console.log(res.locals.user.id);
//   const id = res.locals.user.id;
//   const user = await User.findById(id);
//   console.log(user);
//   const name = user.Doc_FirstName;
//   res.render("./Doc/DocAppDetails.ejs", {
//     name: name,
//   });
// });
router.post("/AppDetails", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const appoId = req.body.appo_Id;
  // console.log(appoId + " appoId");
  const user = await User.findById(id);
  const viewAppoint = await Appo.findById(appoId).populate("Pat_Id");
  // console.log(viewAppoint);
  // console.log(user);
  const name = user.Doc_FirstName;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/DocAppDetails.ejs", {
    name: name,
    appoo: viewAppoint,
    appo: appo,
    number: number,
  });
});
//-------------------------------------------- End Doctor AppDetails---------------------------------------------------
//-------------------------------------------- Start Doctor Write Prescription---------------------------------------------------
router.post("/WritePrescription", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const pat_id = req.body.Pat_Id;
  const appo_id = req.body.Appo_Id;
  // console.log(pat_id);
  // console.log(appo_id);
  const viewAppoint = await Appo.findById(appo_id).populate("Pat_Id");
  // console.log(viewAppoint);
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  //--Notification
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/WritePres.ejs", {
    name: name,
    errorMessage: "",
    appoo: viewAppoint,
    appo: appo,
    number: number,
  });
});
router.post(
  "/WritePrescription-create",
  authorization,
  async (req, res, next) => {
    // console.log(res.locals.user.id);
    const id = res.locals.user.id;
    const pat_id = req.body.Pat_Id;
    const appo_id = req.body.Appo_Id;
    // console.log(pat_id);
    const viewAppoint = await Appo.findOne({ Pat_Id: pat_id }).populate(
      "Pat_Id"
    );
    // console.log(viewAppoint);
    const user = await User.findById(id);
    console.log(user);
    // const name = user.Doc_FirstName;
    try {
      const addNewPrescription = new Prescription({
        pres_Description: req.body.pres_Description,
        CheckUpDay: req.body.CheckUpDay,
        Appoinment_Id: appo_id,
        Pat_id: pat_id,
        Doc_Id: id,
      });

      const savedPrescription = await addNewPrescription.save();
      console.log(savedPrescription);
    } catch (e) {
      console.log(e.message);
    }

    res.redirect("/doctor/ManageAppointments");
  }
);

//-------------------------------------------- End Doctor Write Prescription---------------------------------------------------
//-------------------------------------------- Start Doctor Write Bill---------------------------------------------------
router.post("/WriteBill", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // console.log(user);
  const name = user.Doc_FirstName;
  const appo_id = req.body.Appo_Id;
  // console.log(appo_id);
  const appoId = await Appo.findById(appo_id)
    .populate("Pat_Id")
    .populate("Doc_Id");
  // console.log(appoId);
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/WriteBill.ejs", {
    name: name,
    errorMessage: "",
    number: number,
    appo: appo,
    bill: appoId,
  });
});
router.get("/WriteBill", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  try {
    const shcdeule = await DocSche.find({ Doctor_id: id }).populate(
      "Doctor_id"
    );
    console.log(shcdeule);
  } catch (e) {
    console.log(e.message);
  }
  // console.log(user);
  const name = user.Doc_FirstName;
  const appo_id = req.body.Appo_Id;
  // console.log(appo_id);
  const appoId = await Appo.findById(appo_id)
    .populate("Pat_Id")
    .populate("Doc_Id");
  console.log(appoId);
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/WriteBill.ejs", {
    name: name,
    errorMessage: "",
    number: number,
    appo: appo,
    bill: appoId,
    sehc: shcdeule,
  });
});
router.post("/WriteBill-post", authorization, async (req, res, next) => {
  // console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  try {
    const shcdeule = await DocSche.find({ Doctor_id: id }).populate(
      "Doctor_id"
    );
    console.log(shcdeule);
  } catch (e) {
    console.log(e.message);
  }
  // console.log(user);
  const name = user.Doc_FirstName;
  const appo_id = req.body.appo_Id;
  const patId = req.body.pat_Id;

  // console.log(appo_id);
  try {
    const NewBill = new bill({
      Bill_Amount: req.body.Bill_Amount,
      Appoinment_Id: appo_id,
      Doc_Id: id,
      Pat_Id: patId,
    });
    const savedBill = await NewBill.save();
    console.log(NewBill, "NewBill");
  } catch (e) {
    console.log(e.message);
  }
  const appoId = await Appo.findById(appo_id)
    .populate("Pat_Id")
    .populate("Doc_Id");
  // console.log(appoId);
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: id });
  console.log(number);
  res.render("./Doc/WriteBill.ejs", {
    name: name,
    errorMessage: "",
    number: number,
    appo: appo,
    bill: appoId,
    sehc: shcdeule,
  });
});
//-------------------------------------------- End Doctor Write Bill---------------------------------------------------
///------------------------------------Start View Shedule--------------------------------------------------------
router.get("/DoctorSchedule", authorization, async (req, res) => {
  const DocID = res.locals.user.id;
  const user = await User.findById(DocID);
  const shce = await DocSche.findOne({ Doctor_id: DocID }).sort({ _id: -1 });
  const DocUser = await User.findById(DocID);
  // console.log(user);
  const name = user.Doc_FirstName;
  //--Notification
  const appo = await Appo.find({ Doc_Id: DocID })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const number = await Appo.countDocuments({ Doc_Id: DocID });
  console.log(number);
  res.render("./Doc/DocViewSche.ejs", {
    name: name,
    errorMessage: "",
    DocUser: user,
    appo: appo,
    number: number,
    shce: shce,
  });
});
//------------------------------------EndView Shedule--------------------------------------------------------
//------------------------------------Start ZoomDoc--------------------------------------------------------
// router.get("/ZoomDoc", authorization, async (req, res) => {
//   const DocID = res.locals.user.id;
//   const user = await User.findById(DocID);
//   const name = user.Doc_FirstName;
//   //--Notification
//   const appo = await Appo.find({ Doc_Id: DocID })
//     .populate("Pat_Id")
//     .populate("Doc_Id")
//     .sort({ _id: -1 })
//     .limit(5);
//   const number = await Appo.countDocuments({ Doc_Id: DocID });
//   console.log(number);
//   res.render("./Doc/ZoomDoc.ejs", {
//     name: name,
//     errorMessage: "",
//     DocUser: user,
//     appo: appo,
//     number: number,
//   });
// });
router.post("/ZoomDoc", authorization, async (req, res) => {
  const DocID = res.locals.user.id;
  const appoId = req.body.appo_Id;
  const appo = await Appo.findById(appoId)
    .populate("Pat_Id")
    .populate("Doc_Id");
  console.log(appo);
  console.log(appoId);
  res.render("./Doc/ZoomDoc.ejs", {
    appoo: appoId,
    appo: appo,
  });
});
router.post("/online-meeting-create", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  // const name = user.Doc_FirstName;
  const appoId = req.body.appointmentId;
  const DocID = req.body.doctor_Id;
  const Pat_Id = req.body.patient_Id;
  const DocName = user.Doc_FirstName;
  const pat = await Patient.findById(Pat_Id);
  const name = pat.pat_FirstName;
  const email = pat.pat_Email;
  const link = req.body.Meet_Link;
  console.log(appoId);
  const date = new Date();
  const dataStr = date.toDateString();
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
    },
  });
  let masgEmail = {
    from: `"Doctor 24/7" <${process.env.MAIL_USER}`, // sender address
    to: `${email}`, // list of receivers
    //to: "davidlotfy123@gmail.com",
    subject: "Meeing Link", // Subject line
    // text: "You need to ckeck Up with your Doctor",
    html: `<h2 style=" text-transform: capitalize">Hello ${name}!</h2>
        <h4 >This is the link to Join the meeting with your Dcotor  </h4>
        <p  style=" text-transform: capitalize">Doctor Name: Dr.<b>${DocName}</b></p>
        <p>Meeting Date: <b>${dataStr}</b></p>
        <p>Meeting Link: <a href="${link}">Join Now</a></p>
        <p>Have a nice day!</p>`, // plain text body
    // send mail with defined transport object
  };

  // const appo = await Appo.findById(appoId);
  // console.log(appo);
  try {
    const NewMeet = new Meet_Link({
      Appoinment_Id: appoId,
      Doc_Id: DocID,
      Pat_Id: Pat_Id,
      Meeting_link: req.body.Meet_Link,
    });
    transporter.sendMail(masgEmail, (err, data) => {
      if (err) {
        res.status(400).send(err);
      } else {
        console.log("Email sent");
        res.send(`Email Sent: ${data}`);
      }
    });
    const savedMeet = await NewMeet.save();
    console.log(NewMeet, " NewMeet");
  } catch (e) {
    console.log(e.message);
  }
  // //--Notification
  // const appo = await Appo.find({ Doc_Id: DocID })
  //   .populate("Pat_Id")
  //   .populate("Doc_Id")
  //   .sort({ _id: -1 })
  //   .limit(5);
  // const number = await Appo.countDocuments({ Doc_Id: DocID });
  // console.log(number);
  res.redirect("http://localhost:5000/doctor/ManageAppointments");
});
//------------------------------------End ZoomDoc--------------------------------------------------------
module.exports = router;
