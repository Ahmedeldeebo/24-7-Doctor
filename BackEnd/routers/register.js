const router = require("express").Router();
const User = require("../models/Patient");
const bcrypt = require("bcrypt");

// router.get("/usertest", (req, res) => {
//   res.send("Hello World");
// });
// router.post("/userpost", (req, res) => {
//   const username = req.body.username;
//   console.log(username);
//   res.send("Hello World " + username);
// });

router.post("/patientRegister", async (req, res) => {
  res.send("Register");
  try {
    console.log(req.body);
    const hash = bcrypt.hashSync(req.body.pat_password, saltRounds);
    console.log(hash);
    User.create({
      Pat_username: req.body.Pat_username,
      pat_FirstName: req.body.pat_FirstName,
      pat_Lastname: req.body.pat_Lastname,
      pat_Email: req.body.pat_Email,
      pat_password: hash,
      pat_Gender: req.body.pat_Gender,
      pat_birthday: req.body.pat_birthday,
      pat_InsuranceNo: req.body.pat_InsuranceNo,
    }).then((user) => {
      const payload = { id: user._id, name: user.pat_FirstName, role: "user" };
      jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "3h" },
        (err, token) => {
          if (err) return res.json({ msg: err });
          return res.json({
            accessToken: token,
            name: user.pat_FirstName,
            role: "user",
          });
        }
      );
    });
    //res.redirect("http://localhost:3000/");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
