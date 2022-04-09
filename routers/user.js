const { verifyToken, verifyTokenAndAuthorization } = require("./verifyToken");
const User = require("../models/Patient");

const router = require("express").Router();

/// UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.pat_password) {
    req.body.pat_password = CryptoJS.AES.encrypt(
      req.body.pat_password,
      process.env.PASS_SEC
    ).toString();
  }
  try {
    const upadateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(upadateUser);
  } catch (err) {
    res.satuts(500).json(err);
  }
});

module.exports = router;
