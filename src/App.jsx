import { useState, useEffect, createContext, useContext } from "react";

import BeforeLogin from "./pages/BeforeLogin"
import AfterLogin from "./pages/AfterLogin";
import LoginPage from "./pages/LoginPage";

import WindowSize from "./hooks/windowSize";

import TMslideMenu from "./components/TMslideMenu";

import Header from "./components/Header";
import Footer from "./components/Footer";

import "./App.css";

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  // 컴포넌트 마운트 시 로컬스토리지에서 로그인 상태 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedLoginState = localStorage.getItem('isLoggedIn');
    
    if (savedUser && savedLoginState === 'true') {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 함수
  const login = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setCurrentPage('home');
    
    // 로컬스토리지에 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // 로그아웃 함수
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    
    // 로컬스토리지에서 제거
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  // 페이지 이동 함수
  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      currentUser,
      currentPage,
      login,
      logout,
      navigateToLogin,
      navigateToHome
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 메인 앱 컴포넌트
function AppContent() {
  const { isLoggedIn, currentPage } = useAuth();

  const renderPage = () => {
    if (currentPage === 'login') {
      return <LoginPage />;
    }
    
    if (isLoggedIn) {
      return <AfterLogin />;
    } else {
      return <BeforeLogin />;
    }
  };

  return (
    <>
      <Header />
      {renderPage()}
      <Footer />
    </>
  );
}

function App() {
  const { width, height } = WindowSize();
  return (
    <AuthProvider>
      <AppContent />
      {/* {width > 1200 ? <div className="unkown"></div> : <TMslideMenu />} */}
    </AuthProvider>
  );
}

export default App;