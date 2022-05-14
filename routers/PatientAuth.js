const router = require("express").Router();
const User = require("../models/Patient");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { render } = require("ejs");
const { verifyToken, verifyTokenAndAuthorization } = require("./verifyToken");
const cors = require("cors");
const { body } = require("express-validator");
//--------------------------------------------Register--------------------------------------------
// router.use(cors({ origin: "*", credentials:true  } ) );

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
  const savedyUser = await NewUser.save();
  console.log(NewUser);
  try {
    const savedUser = await NewUser.save();
    console.log(NewUser);
    res.render("signIn.ejs", { errorMessage: "" });
  } catch (err) {
    console.log(err);
  }
});
//-------------------------------------------- End Register---------------------------------------------
//-------------------------------------------- Login ---------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ Pat_username: req.body.Pat_username });
    !user && res.render("signIn.ejs", { errorMessage: "Wrong email" });
    //res.Status(401).json("Wrong credentials!");
    const hashedPassword = CryptoJS.AES.decrypt(
      user.pat_password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    Originalpassword !== req.body.pat_password &&
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
    const name = user.pat_FirstName;
     console.log(accessToken);
    console.log(name);
    return res.render("test.ejs", { name: name }); //res.status(200).json({ ...others, accessToken });
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
router.get("/profile-setting", verifyTokenAndAuthorization,(req, res) => {
  User.find(req.params.id)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  const name = req.body.pat_FirstName;

  res.render("Profile.ejs", { name: name });
});

module.exports = router;
