import { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router 사용
import { useAuth } from "../App";

import "./LoginPage.css";

function LoginPage({ 
  userCredentials, 
  validateCredentials, 
  getUserByCredentials 
}) {
  const { login } = useAuth();
  const navigate = useNavigate(); // React Router의 useNavigate 사용
  
  const [formData, setFormData] = useState({
    id: "",
    pw: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (error) setError("");
  };

  // 로그인 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // props로 받은 validateCredentials 함수 사용 (username/password 형태로 전달)
    if (validateCredentials && validateCredentials(formData.id, formData.pw)) {
      // 로그인 성공
      const user = getUserByCredentials && getUserByCredentials(formData.id, formData.pw);
      if (user) {
        login({
          id: user.username || user.id,
          username: user.username || user.id, // username으로 id 사용
        });
        navigate('/dashboard'); // 로그인 성공 시 대시보드로 이동
      }
    } else {
      // 로그인 실패
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    setIsLoading(false);
  };

  // 특정 사용자로 데모 로그인
  const handleDemoLogin = (userIndex) => {
    if (userCredentials && userCredentials.length > userIndex) {
      const demoUser = userCredentials[userIndex];
      login({
        id: demoUser.id,
        username: demoUser.id,
      });
      navigate('/dashboard'); // 데모 로그인 성공 시 대시보드로 이동
    }
  };

  // 각 소셜 로그인 버튼들
  const handleNaverLogin = () => handleDemoLogin(0);
  const handleGoogleLogin = () => handleDemoLogin(1);
  const handleKakaoLogin = () => handleDemoLogin(2);

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>SafeFall 로그인</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="id">아이디</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pw">비밀번호</label>
            <input
              type="password"
              id="pw"
              name="pw"
              value={formData.pw}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="TMmenuLoginBtnBox">
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
            <button type="button" className="SignUpBtn">
              회원가입
            </button>
          </div>
        </form>

        <div className="autoLoginBox">
          <p className="autoLogin-text">자동 로그인</p>
          {userCredentials && userCredentials.map((user, index) => {
            // 사용자별 버튼 스타일 매핑
            const buttonConfig = {
              0: { text: "Naver 로그인", handler: handleNaverLogin },
              1: { text: "Google 로그인", handler: handleGoogleLogin },
              2: { text: "Kakao 로그인", handler: handleKakaoLogin }
            };
            
            const config = buttonConfig[index];
            if (!config) return null;
            
            return (
              <button 
                key={`demo-login-${user.id}-${index}`}
                className="dumy001Btn" 
                onClick={config.handler}
              >
                {config.text}
              </button>
            );
          })}
          
          {/* 추가 더미 계정이 있는 경우를 위한 일반 버튼 */}
          {userCredentials && userCredentials.length > 3 && (
            <button 
              className="dumy001Btn" 
              onClick={() => handleDemoLogin(3)}
            >
              더미 계정 로그인
            </button>
          )}
        </div>

        <div className="login-footer">
          <button className="back-button" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;