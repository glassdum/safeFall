import { useState, useEffect, createContext, useContext } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import BeforeLogin from "./pages/BeforeLogin";
import AfterLogin from "./pages/AfterLogin";
import LoginPage from "./pages/LoginPage";
import CheckHistory from "./pages/CheckHistory";
import CheckVideo from "./pages/CheckVideo";

import WindowSize from "./hooks/windowSize";
import { DataProvider, useData } from "./hooks/DataContext";

import Header from "./components/Header";
import Footer from "./components/Footer";

import "./App.css";

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 컴포넌트 마운트 시 로컬스토리지에서 로그인 상태 확인
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedLoginState = localStorage.getItem("isLoggedIn");

    if (savedUser && savedLoginState === "true") {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 함수
  const login = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);

    // 로컬스토리지에 저장
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  // 로그아웃 함수
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);

    // 로컬스토리지에서 제거
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 공개 라우트 컴포넌트 (로그인 시 리다이렉트)
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 페이지 래퍼 컴포넌트
const PageWrapper = () => {
  const {
    // 실시간 영상 관련
    LiveVideoComponent,
    liveVideoConfig,
    getLiveVideoComponent,
    updateLiveVideoConfig,
    updateStreamStatus,

    // 사고 영상 관련
    incidentVideos,
    updateVideoCheckStatus,
    addNewIncidentVideo,
    deleteIncidentVideo,
    getFilteredVideos,

    // 로그인 관련
    userCredentials,
    validateCredentials,
    getUserByCredentials,

    // 필터링 관련
    videoFilters,
    updateFilters,
    resetFilters,

    // 통계 관련
    getVideoStats,
    getRecentVideos,
  } = useData();

  return (
    <>
      <Header />
      <Routes>
        {/* 공개 라우트 */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <BeforeLogin />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage
                userCredentials={userCredentials}
                validateCredentials={validateCredentials}
                getUserByCredentials={getUserByCredentials}
              />
            </PublicRoute>
          }
        />

        {/* 보호된 라우트 */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AfterLogin
                incidentVideos={incidentVideos}
                LiveVideoComponent={LiveVideoComponent}
                liveVideoConfig={liveVideoConfig}
                // 원본 변형 방지를 위해 복사 후 정렬
                getRecentVideos={(count = 6) => {
                  return [...incidentVideos]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, count);
                }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <CheckHistory
                incidentVideos={incidentVideos}
                updateVideoCheckStatus={updateVideoCheckStatus}
                deleteIncidentVideo={deleteIncidentVideo}
                getFilteredVideos={getFilteredVideos}
                videoFilters={videoFilters}
                updateFilters={updateFilters}
                resetFilters={resetFilters}
                getVideoStats={getVideoStats}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:filename"
          element={
            <ProtectedRoute>
              <CheckVideo
                incidentVideos={incidentVideos}
                updateVideoCheckStatus={updateVideoCheckStatus}
                LiveVideoComponent={LiveVideoComponent}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <CheckVideo
                LiveVideoComponent={LiveVideoComponent}
                liveVideoConfig={liveVideoConfig}
                updateStreamStatus={updateStreamStatus}
              />
            </ProtectedRoute>
          }
        />

        {/* 404 페이지 → 공개 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  const { width, height } = WindowSize();

  return (
    <HashRouter>
      <DataProvider>
        <AuthProvider>
          <PageWrapper />
        </AuthProvider>
      </DataProvider>
    </HashRouter>
  );
}

export default App;
