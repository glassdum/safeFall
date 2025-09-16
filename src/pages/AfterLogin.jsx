import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router 사용

import DBGraph from "../components/DBGraph";
import FlaskVideoStream from "../hooks/RaspberryPiWebRTC";
import WindowSize from "../hooks/windowSize";

import "./AfterLogin.css";

import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

function AfterLogin({ 
  incidentVideos, 
  LiveVideoComponent, 
  liveVideoConfig, 
  getRecentVideos 
}) {
  const [windowSizeTF, setWindowSizeTF] = useState(false);
  
  // 훅들
  const { width } = WindowSize();
  const navigate = useNavigate(); // React Router의 useNavigate 사용

  // width 값에 따라 windowSizeTF 상태 업데이트
  useEffect(() => {
    if (width >= 1200) {
      setWindowSizeTF(false);
    } else {
      setWindowSizeTF(true);
    }
  }, [width]);

  // 최신 6개 영상 데이터 가져오기
  const getRecentSixVideos = () => {
    if (!incidentVideos || !Array.isArray(incidentVideos)) {
      return []; // 데이터가 없거나 배열이 아닌 경우 빈 배열 반환
    }

    if (getRecentVideos && typeof getRecentVideos === 'function') {
      // props로 받은 함수가 있으면 사용
      const result = getRecentVideos(6);
      return Array.isArray(result) ? result : [];
    } else {
      // 없으면 직접 처리
      return incidentVideos
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 최신순 정렬
        .slice(0, 6); // 최신 6개만 선택
    }
  };

  // 더보기 버튼 클릭 핸들러
  const handleMoreVideos = () => {
    navigate('/history'); // React Router 네비게이션
  };

  // 영상 클릭 핸들러 (상세 페이지로 이동)
  const handleVideoClick = (filename) => {
    const encodedFilename = encodeURIComponent(filename);
    navigate(`/video/${encodedFilename}`);
  };

  return (
    <div className="AfterLoginWindowDesktop">
      {/* 더미데이터 */}
      {/* 사용 완료시 삭제 */}
      {/* 더미데이터의 css는 App.css에 위치 */}
      {/* <RaspberryPiWebRTC /> */}
      {/* 백엔드 없을 때 더미 영상 사용하려면 아래 주석 해제 */}
      {/* <div className="dumybox001">
        <LiveVideoComponent />
      </div> */}
      
      <div className="realtimevideoBox">
        <FlaskVideoStream />
      </div>
      
      <div className="listAndGraphWindowDesktop">
        <div className="listWindowDesktop">
          <h3>기록보기</h3>
          <ul className="DBlistSmall">
            {windowSizeTF === false
              ? // 데스크톱 버전 (width >= 1200)
                getRecentSixVideos().map((item, index) => (
                  <li 
                    key={`${item.filename}-${item.createdAt}-${index}`}
                    onClick={() => handleVideoClick(item.filename)}
                    style={{ cursor: 'pointer' }}
                  >
                    <p>
                      <span>
                        <VideoBtnSmall />
                      </span>
                      {item.filename}
                    </p>
                    <div
                      className={
                        item.isChecked
                          ? "checkBoxSmall checkFinish"
                          : "checkBoxSmall checkPrev"
                      }
                    >
                      {item.isChecked ? "완료" : "대기"}
                    </div>
                  </li>
                ))
              : // 모바일 버전 (width < 1200)
                getRecentSixVideos().map((item, index) => (
                  <li 
                    key={`${item.filename}-${item.createdAt}-${index}`}
                    onClick={() => handleVideoClick(item.filename)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="sumnailBox">
                      <VideoBtnSmall />
                    </div>
                    <div className="DBListInfoBox">
                      <p className="DBListFilename">{item.filename}</p>
                      <p className="DBListCreatedAt">{item.createdAt}</p>
                      <div className="checkline">
                        <p>확인 여부</p>
                        <div
                          className={
                            item.isChecked
                              ? "checkBoxSmall checkFinish"
                              : "checkBoxSmall checkPrev"
                          }
                        >
                          {item.isChecked ? "완료" : "대기"}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
          </ul>
          <button onClick={handleMoreVideos}>더보기</button>
        </div>
        <div className="graphWindowDesktop">
          <DBGraph incidentVideos={incidentVideos} />
        </div>
      </div>
    </div>
  );
}

export default AfterLogin;