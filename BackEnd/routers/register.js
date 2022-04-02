const router = require("express").Router();

router.get("/usertest", (req, res) => {
  res.send("Hello World");
});
router.post("/userpost", (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.send("Hello World " + username);
});

module.exports = router;
