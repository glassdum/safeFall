import { useState, useEffect } from "react";

import Logo from "../assets/Logo";
import LoginDesk from "./LoginDesk";
import LoginMobile from "./LoginMobile";
import useWindowSize from "../hooks/windowSize";

import "./Header.css";

function Header() {

    const { width, height } = useWindowSize();

  return (
    <header>
      <div className="HeaderSection">
        <Logo />
        {
            width < 1200 ? (
                <LoginMobile></LoginMobile>
            ) : (
                <LoginDesk></LoginDesk>
            )
        }
      </div>
    </header>
  );
}

export default Header;
