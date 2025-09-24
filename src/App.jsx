import { useState, useEffect, createContext, useContext } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import BeforeLogin from "./pages/BeforeLogin";
import AfterLogin from "./pages/AfterLogin";
import LoginPage from "./pages/LoginPage";
import CheckHistory from "./pages/CheckHistory";
import CheckVideo from "./pages/CheckVideo";

import { DataProvider, useData } from "./hooks/DataContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Alert from "./components/Alter";  // ✅ Alert 컴포넌트 추가

import { apiService } from "./services/api";  // ✅ API 서비스 추가

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
    console.log('🔍 Login userData:', userData); // 디버그용
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

// 알람 관리 컴포넌트 (PageWrapper 내부에서 사용)
const AlertManager = () => {
  const { isLoggedIn } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({});
  const [isPollingActive, setIsPollingActive] = useState(false);

  // 알람 표시 함수
  const showNotification = (title, message, severity, additionalData = {}) => {
    console.log('🚨 New notification:', { title, message, severity, additionalData });
    
    setAlertData({
      createdAt: new Date().toISOString(),
      device_id: additionalData.device_id || "camera_01",
      type: severity === "high" ? "fall" : 
            severity === "medium" ? "frame" : "normal",
      filename: additionalData.filename || `alert_${Date.now()}.mp4`,
      title: title,
      message: message,
      severity: severity,
      ...additionalData  // 추가 데이터 병합
    });
    setShowAlert(true);
  };

  // 알람 닫기 함수
  const handleCloseAlert = () => {
    setShowAlert(false);
    setAlertData({});
  };

  // 알람 폴링 (로그인 상태일 때만 활성화)
  useEffect(() => {
    if (!isLoggedIn) {
      setIsPollingActive(false);
      return;
    }

    setIsPollingActive(true);
    console.log('🔄 Starting notification polling...');

    const pollInterval = setInterval(async () => {
      try {
        const data = await apiService.getLatestNotifications();
        
        if (data && data.count > 0 && Array.isArray(data.notifications)) {
          data.notifications.forEach(notif => {
            showNotification(
              notif.title || "알림", 
              notif.message || "새로운 알림이 있습니다", 
              notif.severity || "medium",
              {
                id: notif.id,
                device_id: notif.device_id,
                type: notif.type,
                filename: notif.filename,
                createdAt: notif.createdAt
              }
            );
          });
        }
      } catch (error) {
        console.error('Notification polling failed:', error);
        // 에러 발생 시에도 폴링 계속 (백엔드 준비 전까지)
      }
    }, 3000); // 3초마다

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      console.log('🛑 Stopping notification polling...');
      clearInterval(pollInterval);
      setIsPollingActive(false);
    };
  }, [isLoggedIn]);

  // 개발/테스트용 전역 함수 등록
  useEffect(() => {
    // 브라우저 콘솔에서 테스트용
    window.triggerTestAlert = (type = 'fall', severity = 'high') => {
      const testNotifications = {
        fall: {
          title: "낙상 감지",
          message: "거실에서 낙상이 감지되었습니다",
          severity: "high"
        },
        frame: {
          title: "이상 상황",
          message: "카메라에서 이상 상황이 감지되었습니다",
          severity: "medium"
        },
        normal: {
          title: "일반 알림",
          message: "시스템 정상 동작 중입니다",
          severity: "low"
        }
      };

      const notif = testNotifications[type] || testNotifications.fall;
      showNotification(notif.title, notif.message, severity);
    };

    window.showTestNotification = showNotification;

    // cleanup
    return () => {
      delete window.triggerTestAlert;
      delete window.showTestNotification;
    };
  }, []);

  // 폴링 상태 디버그 정보 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Alert polling status:', {
        isLoggedIn,
        isPollingActive,
        showAlert
      });
    }
  }, [isLoggedIn, isPollingActive, showAlert]);

  return (
    <Alert 
      isVisible={showAlert}
      onClose={handleCloseAlert}
      alertData={alertData}
    />
  );
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
      
      {/* ✅ 알람 관리자 - 모든 페이지에서 활성화 */}
      <AlertManager />
    </>
  );
};

function App() {
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