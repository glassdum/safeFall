import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DBGraph from "../components/DBGraph";
import LiveVideo from "../components/LiveVideo";   // ← 변경된 부분
import WindowSize from "../hooks/windowSize";

// import apiService from "../api/api.js";
import apiService from "../services/api";
import "./AfterLogin.css";
import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

function AfterLogin({
  incidentVideos: incidentVideosProp,
  LiveVideoComponent,
  liveVideoConfig,
  getRecentVideos: getRecentVideosProp,
}) {
  const [windowSizeTF, setWindowSizeTF] = useState(false);
  const [incidentVideos, setIncidentVideos] = useState([]);
  const { width } = WindowSize();
  const navigate = useNavigate();

  useEffect(() => {
    setWindowSizeTF(!(width >= 1200));
  }, [width]);

  // 최근 낙상 영상 6개 불러오기
  useEffect(() => {
    if (Array.isArray(incidentVideosProp) && incidentVideosProp.length) {
      setIncidentVideos(incidentVideosProp);
      return;
    }

    (async () => {
      try {
        const res = await apiService.getVideos({
          page: 1,
          limit: 6,
          sortBy: "createdAt",
          sortOrder: "desc",
          type: "fall",
        });
        setIncidentVideos(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn("Failed to load recent fall videos:", e?.message || e);
        setIncidentVideos([]);
      }
    })();
  }, [incidentVideosProp]);

  const getRecentSixVideos = () => {
    if (typeof getRecentVideosProp === "function") {
      const out = getRecentVideosProp(6);
      return Array.isArray(out) ? out : [];
    }
    return (incidentVideos || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  };

  const handleMoreVideos = () => {
    navigate("/history");
  };

  const handleVideoClick = (item) => {
    navigate(`/video/${encodeURIComponent(item.id)}`);
  };

  return (
    <div className="AfterLoginWindowDesktop">
      {/* 실시간 스트림 */}
      <div className="realtimevideoBox">
        <LiveVideo />   {/* ← FlaskVideoStream 대신 교체 */}
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
