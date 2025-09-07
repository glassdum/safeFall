import { useState, useEffect } from "react";

import Logo from "../assets/Logo";
import LoginDesk from "./LoginDesk";
import LoginMobile from "./LoginMobile";
import WindowSize from "../hooks/windowSize";
import { useAuth } from "../App";

import "./Header.css";

function Header() {
  const { width, height } = WindowSize();
  const { isLoggedIn, currentUser, logout, navigateToHome, navigateToLogin } = useAuth();

  // Logo 클릭 핸들러
  const handleLogoClick = () => {
    navigateToHome();
  };

  return (
    <header>
      <div className="HeaderSection">
        {/* Logo 클릭 시 홈으로 이동 */}
        <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Logo />
        </div>
        
        {width < 1200 ? (
          <div className="mainmenuBtn">
            {isLoggedIn ? (
              // 로그인된 상태: LoginMobile 클릭 시 로그아웃
              <div onClick={logout} style={{ cursor: 'pointer' }}>
                <LoginMobile />
              </div>
            ) : (
              // 로그인 안된 상태: LoginMobile 클릭 시 로그인 페이지로
              <div onClick={navigateToLogin} style={{ cursor: 'pointer' }}>
                <LoginMobile />
              </div>
            )}
          </div>
        ) : (
          // 데스크톱 버전: LoginDesk에 로그인 상태 전달
          <LoginDesk 
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLogin={navigateToLogin}
            onLogout={logout}
          />
        )}
      </div>
    </header>
  );
}

export default Header;