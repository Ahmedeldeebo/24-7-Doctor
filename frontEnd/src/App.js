import React from "react";
import { BrowserRouter, Switch, Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import PatientReg from "./components/pages/PatientReg";
import doctorReg from "./components/pages/doctorReg";
import NavBar from "./components/NavBar";
function App() {
  return (
    <div className="App">
      <NavBar />
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<PatientReg />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
