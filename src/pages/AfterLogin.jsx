import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DBGraph from "../components/DBGraph";
import FlaskVideoStream from "../hooks/RaspberryPiWebRTC";
import WindowSize from "../hooks/windowSize";

import apiService from "../services/api";
//import apiService from "../api/api.js"; // ← 백엔드 호출용 (이미 있는 httpClient 기반)
import "./AfterLogin.css";
import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

function AfterLogin({
  // 기존 props는 있으면 사용하고, 없으면 자체 fetch로 대체
  incidentVideos: incidentVideosProp,
  LiveVideoComponent,
  liveVideoConfig,
  getRecentVideos: getRecentVideosProp,
}) {
  const [windowSizeTF, setWindowSizeTF] = useState(false);
  const [incidentVideos, setIncidentVideos] = useState([]); // ← 내부 상태
  const { width } = WindowSize();
  const navigate = useNavigate();

  useEffect(() => {
    setWindowSizeTF(!(width >= 1200));
  }, [width]);

  // 최근 낙상 영상 6개를 백엔드에서 가져오기
  useEffect(() => {
    // props로 이미 주입되면 그대로 사용
    if (Array.isArray(incidentVideosProp) && incidentVideosProp.length) {
      setIncidentVideos(incidentVideosProp);
      return;
    }

    // 없으면 직접 API 호출
    (async () => {
      try {
        const res = await apiService.getVideos({
          page: 1,
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc",
          type: "fall",
        });
        // 백엔드 형식: { data: [...], pagination: {...} }
        setIncidentVideos(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn("Failed to load recent fall videos:", e?.message || e);
        setIncidentVideos([]);
      }
    })();
  }, [incidentVideosProp]);

  // 기존 getRecentVideos Prop 우선 사용, 없으면 내부 incidentVideos에서 6개 정렬
  const getRecentSixVideos = () => {
    if (typeof getRecentVideosProp === "function") {
      const out = getRecentVideosProp(6);
      return Array.isArray(out) ? out : [];
    }
    return (incidentVideos || [])
      .slice() // copy
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  };

  const handleMoreVideos = () => {
    navigate("/history");
  };

  // 상세 페이지 라우팅: 백엔드가 /videos/:id 이므로 id 사용 권장
  const handleVideoClick = (item) => {
    // 기존 코드가 filename으로 라우팅한다면, 프론트 라우트를 id 기준으로 바꾸는게 안전
    navigate(`/video/${encodeURIComponent(item.id)}`);
  };

  return (
    <div className="AfterLoginWindowDesktop">
      {/* 실시간 스트림(라즈베리파이): 환경변수 VITE_FLASK_URL 있으면 동작 */}
      <div className="realtimevideoBox">
        <FlaskVideoStream />
      </div>

      <div className="listAndGraphWindowDesktop">
        <div className="listWindowDesktop">
          <h3>기록보기</h3>
          <ul className="DBlistSmall">
            {getRecentSixVideos().map((item, index) => (
              <li
                key={`${item.id}-${item.filename}-${index}`}
                onClick={() => handleVideoClick(item)}
                style={{ cursor: "pointer" }}
              >
                {windowSizeTF ? (
                  // 모바일
                  <>
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
                  </>
                ) : (
                  // 데스크톱
                  <>
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
                  </>
                )}
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
