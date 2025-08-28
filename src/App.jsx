import { useState } from "react";

import AfterLogin from "./pages/AfterLogin";

import Header from "./components/Header";
import Footer from "./components/Footer";

import "./App.css";

function App() {
  return (
    <>
      <Header />
      <AfterLogin />
      <Footer />
    </>
  );
}

export default App;
