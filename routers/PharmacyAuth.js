const router = require("express").Router();
const User = require("../models/Pharmacy");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Tikcet = require("../models/Ticket");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { render } = require("ejs");
const cors = require("cors");
const { body } = require("express-validator");
const { authorization } = require("./verifyToken");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

router.post("/Pharmcy-register", async (req, res) => {
  console.log(req.body);
  try {
    const NewUser = new User({
      Phar_userName: req.body.Phar_userName,
      Phar_name: req.body.Phar_name,
      Phar_Email: req.body.Phar_Email,
      Phar_PhoneNumber: req.body.Phar_PhoneNumber,
      Phar_location: req.body.Phar_location,
      Phar_Password: CryptoJS.AES.encrypt(
        req.body.Phar_Password,
        process.env.PASS_SEC
      ).toString(),
    });
    const savedUser = await NewUser.save();
    console.log(NewUser);
  } catch (e) {
    console.log(e.message);
    res.render("./Pharmacy/PharmacySignUp.ejs", {
      errorMessage: "Something is missing",
    });
  }

  // const savedUser = await NewUser.save();
  // console.log(NewUser);

  res.render("./Pharmacy/signInPhar.ejs", {
    errorMessage: "Account Created Successfully",
  });
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/Pharmacy-login", async (req, res) => {
  try {
    const user = await User.findOne({ Phar_userName: req.body.Phar_userName });
    !user &&
      res.render("./Pharmacy/signInPhar.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.Phar_Password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.Phar_Password &&
      res.render("./Pharmacy/signInPhar.ejs", {
        errorMessage: "Wrong password",
      });
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
    // const name = user.Phar_name;
    console.log(accessToken);
    // console.log(name);

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .redirect("/Pharmacy/Pharmacy-profile"); //res.status(200).json({ ...others, accessToken });
  } catch (e) {
    return console.log(e.message);
  }
});

//------------------------------------End Login--------------------------------------------------------
//------------------------------------Start Pharmacy Profile--------------------------------------------------------
//Profile
router.get("/Pharmacy-profile", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;
  console.log(user);
  const countUser = await User.countDocuments({});
  console.log("User " + countUser);
  const countPat = await Patient.countDocuments({});
  console.log("Patient " + countPat);
  const countDoc = await Doctor.countDocuments({});
  console.log("Doctors " + countDoc);
  res.render("./Pharmacy/PhaHome.ejs", {
    name: name,
    countUser: countUser,
    countPat: countPat,
    countDoc: countDoc,
  });
});
router.get("/PharmacyProfile", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;

  res.render("./Pharmacy/PharProfile.ejs", {
    name: name,
    user: user,
    errorMessage: "",
  });
});
//------------------------------------End Pharmacy Profile-------------------------------------------------------
//------------------------------------Start Pharmacy Edit Profile--------------------------------------------------------
router.get("/PharmacyProfileEdit", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;

  res.render("Pharmacy/PharProfileEdit.ejs", { name: name, user: user });
});
router.post("/PharmacyProfileEdit", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.redirect("/pharmacy/PharmacyProfile");
  } catch (e) {
    console.log(e.message);

    res.redirect("/pharmacy/PharmacyProfile");
  }
});
//------------------------------------End Pharmacy Edit Profile--------------------------------------------------------
//------------------------------------Start Pharmacy Ticket--------------------------------------------------------
router.get("/PharTicket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;
  res.render("Pharmacy/PharTicket.ejs", { name: name });
});
router.post("/PharTicket", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;
  try {
    const NewTicket = new Tikcet({
      ticket_Name: req.body.ticket_Name,
      ticket_Email: req.body.ticket_Email,
      ticket_details: req.body.ticket_details,
      Phar_Id: id,
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
  res.render("Pharmacy/PharTicket.ejs", { name: name });
});
//------------------------------------End Pharmacy Ticket--------------------------------------------------------
//------------------------------------Start Pharmacy Prescription view--------------------------------------------------------
router.get("/Prescriptions", authorization, async (req, res) => {
  const id = res.locals.user.id;
  const user = await User.findById(id);
  const name = user.Phar_name;
  res.render("Pharmacy/Prescriptions.ejs", { name: name });
});
//------------------------------------End Pharmacy Prescription view--------------------------------------------------------

module.exports = router;
