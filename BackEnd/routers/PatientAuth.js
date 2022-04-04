const router = require("express").Router();
const User = require("../models/Patient");
const CryptoJS = require("crypto-js");

//--------------------------------------------Register--------------------------------------------
router.post("/register", async (req, res) => {
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
  try {
    const savedUser = await NewUser.save();
    console.log(NewUser);
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ Pat_username: req.body.Pat_username });
    !user && res.status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.pat_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.pat_password &&
      res.status(401).json("Wrong credentials!");

    const { pat_password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
