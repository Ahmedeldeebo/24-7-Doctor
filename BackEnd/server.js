const express = require("express");
const port = 5000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PatientAuthRouter = require("./routers/PatientAuth");

dotenv.config();

mongoose
  .connect(process.env.mongoUri)
  .then(() => console.log("Mongooes is connected"))
  .catch((err) => {
    console.log(err);
  });


app.use(express.json());
app.get("/",(req,res) =>{
  res.send("working")
});
app.use("/api/patient", PatientAuthRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
