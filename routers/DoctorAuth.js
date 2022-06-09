const router = require("express").Router();
const Patient = require("../models/Patient");
const User = require("../models/Doctor");
const Appo = require("../models/Aappointment");
const DocSche = require("../models/Doc_Schedule");
const ticket = require("../models/Ticket");
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
  const scheduleList = await DocSche.find({}).populate("Doctor_id");
  const result = scheduleList.filter(
    (schedule) => schedule.Meeting_Maximum_Patient > 0
  );
  //--Notification
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const query = Appo.find({ Pat_Id: id });
  query.count(function (err, count) {
    if (err) console.log(err);
    else console.log("Count is", count);
    const number = count;
    console.log(number);
    console.log(user);
    console.log(appo);

    res.render("doctorview.ejs", {
      Sch: result,
      name: name,
      appo: appo,
      number: number,
    });
  });
});
router.post("/doctorview", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await Patient.findById(id);
  const name = user.pat_FirstName;
  const SpecName = req.body.SpecName;

  let scheduleList = await DocSche.find().populate("Doctor_id");
  const result = scheduleList.filter(
    (schedule) => schedule.Doctor_id.Specialization_Name === SpecName
    //&& schedule.Meeting_Maximum_Patient > 0
  );
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const query = Appo.find({ Pat_Id: id });
  query.count(function (err, count) {
    if (err) console.log(err);
    else console.log("Count is", count);
    const number = count;

    console.log(result);
    console.log(SpecName);
    // res.send(result);
    res.render("doctorview.ejs", {
      Sch: result,
      name: name,
      appo: appo,
      number: number,
    });
  });
});
router.get("/doctorview-doc", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Doc_FirstName;
  console.log(req.body);
  const users = await User.find({});
  console.log(users);
  res.render("./Doc/docDoctorview.ejs", {
    users: users,
    name: name,
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
  res.render("./Doc/DocProfile.ejs", {
    name: name,
    user: user,
  });
});
//edit
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
    user: user,
  });
});
router.post("/DocProfileEdit", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
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

    res.redirect("/doctor/Doctor-profile-setting");
  }
  res.render("./Doc/DocProfile.ejs", {
    name: name,
    user: user,
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
  const appo = await Appo.find({ Doc_Id: id })
    .populate("Doc_Id")
    .sort({ _id: -1 });
  console.log(user);
  console.log(appo);

  res.render("./Doc/DocMangApp.ejs", { name: name, appo: appo });
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
router.post("/UpdateSchedule", authorization, async (req, res, next) => {
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
    console.log(e.masssage + " not working ");
  }
  // try {
  //   const updateDocSche = await DocSche.findOneAndUpdate(
  //     { Doctor_id: id },
  //     {
  //       $set: req.body,
  //     },
  //     { new: true }
  //   );
  // } catch (e) {
  //   console.log(e.message);

  //   res.redirect("/doctor/UpdateSchedule");
  // }
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
  const appo = await Appo.find({ Pat_Id: id })
    .populate("Pat_Id")
    .populate("Doc_Id")
    .sort({ _id: -1 })
    .limit(5);
  const query = Appo.find({ Pat_Id: id });
  query.count(function (err, count) {
    if (err) console.log(err);
    else console.log("Count is", count);
    const number = count;
    console.log(number);
    console.log(user);
    console.log(appo);

    res.render("./Patient/viewDocSche.ejs", {
      DocUser: DocUser,
      shce: shce,
      name: name,
      number: number,
      appo: appo,
    });
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
    const docName = await User.findOne({ Doc_FirstName: DocName });
    const docId = docName._id;
    const Doc = await User.findById(docId);
    const shce = await DocSche.findOne({ Doctor_id: docId }).populate(
      "Doctor_id"
    );
    console.log(shce);
    console.log(docName);
    console.log(docId);
    res.render("./Patient/DocSearch.ejs", {
      Doc: Doc,
      name: name,
      shce: shce,
    });
  } catch (e) {
    console.log(e.masssage);
  }
  res.render("search.ejs");
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
    console.log(shce);
    console.log(docName);
    console.log(docId);
    res.render("./Patient/DocSearch.ejs", { Doc: Doc, name: name, shce: shce });
  } catch (e) {
    console.log(e.masssage);
    res.render("search.ejs");
  }
});

//-------------------------------------------- End Doc Search ---------------------------------------------------
//-------------------------------------------- Start Doctor AppDetails---------------------------------------------------
router.get("/AppDetails", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  res.render("./Doc/DocAppDetails.ejs", {
    name: name,
  });
});
router.post("/AppDetails", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const pat_id = req.body.Pat_Id;
  console.log(pat_id);
  const user = await User.findById(id);
  const viewAppoint = await Appo.findOne({ Pat_Id: pat_id }).populate("Pat_Id");
  console.log(viewAppoint);
  console.log(user);
  const name = user.Doc_FirstName;
  res.render("./Doc/DocAppDetails.ejs", {
    name: name,
    appo: viewAppoint,
  });
});
//-------------------------------------------- End Doctor AppDetails---------------------------------------------------
//-------------------------------------------- Start Doctor Write Prescription---------------------------------------------------
router.post("/WritePrescription", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const pat_id = req.body.Pat_Id;
  const appo_id = req.body.Appo_Id;
  console.log(pat_id);
  console.log(appo_id);
  const viewAppoint = await Appo.findOne({ Pat_Id: pat_id }).populate("Pat_Id");
  console.log(viewAppoint);
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;

  res.render("./Doc/WritePres.ejs", {
    name: name,
    errorMessage: "",
    appo: viewAppoint,
  });
});
router.post(
  "/WritePrescription-create",
  authorization,
  async (req, res, next) => {
    console.log(res.locals.user.id);
    const id = res.locals.user.id;
    const pat_id = req.body.Pat_Id;
    const appo_id = req.body.Appo_Id;
    console.log(pat_id);
    const viewAppoint = await Appo.findOne({ Pat_Id: pat_id }).populate(
      "Pat_Id"
    );
    console.log(viewAppoint);
    const user = await User.findById(id);
    console.log(user);
    const name = user.Doc_FirstName;
    try {
      const addNewPrescription = new Prescription({
        pres_Description: req.body.pres_Description,
        Appoinment_Id: appo_id,
        Pat_id: pat_id,
        Doc_Id: id,
      });
      const savedPrescription = await addNewPrescription.save();
      console.log(savedPrescription);
    } catch (e) {
      console.log(e.masssage);
    }

    res.redirect("/doctor/ManageAppointments");
  }
);

//-------------------------------------------- End Doctor Write Prescription---------------------------------------------------
//-------------------------------------------- Start Doctor Write Bill---------------------------------------------------
router.get("/WriteBill", authorization, async (req, res, next) => {
  console.log(res.locals.user.id);
  const id = res.locals.user.id;
  const user = await User.findById(id);
  console.log(user);
  const name = user.Doc_FirstName;
  const email = user.Doc_Email;
  res.render("./Doc/WriteBill.ejs", {
    name: name,
    email: email,
    errorMessage: "",
  });
});
//-------------------------------------------- End Doctor Write Bill---------------------------------------------------

module.exports = router;
