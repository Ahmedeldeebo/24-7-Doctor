const router = require("express").Router();
const User = require("../models/Pharmacy");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { render } = require("ejs");
const cors = require("cors");
const { body } = require("express-validator");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

router.post("/Pharmcy-register", async (req, res) => {
  console.log(req.body);

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
  try {
    const savedUser = await NewUser.save();
    console.log(NewUser);

    res.render("PharmacySignup.ejs", { errorMessage: "" });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/Pharmacy-login", async (req, res) => {
  try {
    const user = await User.findOne({ Phar_userName: req.body.Phar_userName });
    !user && res.render("signIn.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.Phar_Password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.Phar_Password &&
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
    );

    // const { Doc_password, ...others } = user._doc;
    const name = user.Phar_name;
    console.log(accessToken);
    console.log(name);

    return res.render("test.ejs", { name: name }); //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});

module.exports = router;
