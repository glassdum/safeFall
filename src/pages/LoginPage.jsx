import { useState } from "react";
import { useAuth } from "../App";
import Dum004 from "../util/Dum004.json";

import "./LoginPage.css";

function LoginPage() {
  const { login, navigateToHome } = useAuth();
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

    // Dum004 데이터와 매칭 확인
    const user = Dum004.find(
      (u) => u.id === formData.id && u.pw === formData.pw
    );

    if (user) {
      // 로그인 성공
      login({
        id: user.id,
        username: user.id, // username으로 id 사용
      });
    } else {
      // 로그인 실패
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    setIsLoading(false);
  };

  // 데모 로그인 (Dum004의 첫 번째 계정으로 자동 로그인)
  const handleDemoLogin = () => {
    if (Dum004.length > 0) {
      const demoUser = Dum004[0];
      login({
        id: demoUser.id,
        username: demoUser.id,
      });
    }
  };
  const handleDemoLogin1 = () => {
    if (Dum004.length > 0) {
      const demoUser = Dum004[1];
      login({
        id: demoUser.id,
        username: demoUser.id,
      });
    }
  };
  const handleDemoLogin2 = () => {
    if (Dum004.length > 0) {
      const demoUser = Dum004[2];
      login({
        id: demoUser.id,
        username: demoUser.id,
      });
    }
  };

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
            <button className="SignUpBtn">회원가입</button>
          </div>
        </form>
        <div className="autoLoginBox">
          <p className="autoLogin-text">자동 로그인</p>
          <button className="dumy001Btn" onClick={handleDemoLogin}>
            Naver 로그인
          </button>
          <button className="dumy001Btn" onClick={handleDemoLogin1}>
            Google 로그인
          </button>
          <button className="dumy001Btn" onClick={handleDemoLogin2}>
            Kakao 로그인
          </button>
        </div>
        <div className="login-footer">
          <button className="back-button" onClick={navigateToHome}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
