const router = require("express").Router();
const User = require("../models/Doctor");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { render } = require("ejs");
const cors = require("cors");
const { body } = require("express-validator");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

router.post("/Doctor-register", async (req, res) => {
  console.log(req.body);

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
    Upfornt_fees: req.body.Upfornt_fees,
  });
  const savedyUser = await NewUser.save();
  console.log(NewUser);
  try {
    const savedUser = await NewUser.save();
    console.log(NewUser);

    res.render("DocSignup.ejs", { errorMessage: "" });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/Docter-login", async (req, res) => {
  try {
    const user = await User.findOne({ Doc_username: req.body.Doc_username });
    !user && res.render("signIn.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.Doc_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.Doc_password &&
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
    const name = user.Doc_FirstName;
    console.log(accessToken);
    console.log(name);

    return res.render("test.ejs", { name: "Dr." + name }); //res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return console.log(err);
  }
});

module.exports = router;
