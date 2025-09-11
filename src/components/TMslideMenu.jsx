import { useState } from "react";

import WindowSize from "../hooks/windowSize";

import Logo from "../assets/Logo";

import "./TMslideMenu.css";

function TMslideMenu() {
  const { width, height } = WindowSize();

  return(
    <div className="TMmenuBox">
        <div className="TMmenuBG"></div>
        <menu>
            <div className="TMmenuLogobox"><Logo /></div>
            <ul>
                <li></li>
            </ul>
            <div className="TMmenuLoginBox">
              <button>Login</button>
            </div>
        </menu>
    </div>
  );
}

export default TMslideMenu;
