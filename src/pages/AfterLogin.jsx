import { useState, useEffect } from "react";

import DBGraph from "../components/DBGraph";
import FlaskVideoStream from "../hooks/RaspberryPiWebRTC";
import WindowSize from "../hooks/windowSize";

import "./AfterLogin.css";

import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

// import Dum001 from "../hooks/dum001";
import Dum003 from "../util/Dum003.json";

function AfterLogin() {
  const [windowSizeTF, setWindowSizeTF] = useState(false);
  // windowSize 훅 사용
  const { width } = WindowSize();

  // width 값에 따라 windowSizeTF 상태 업데이트
  useEffect(() => {
    if (width >= 1200) {
      setWindowSizeTF(false);
    } else {
      setWindowSizeTF(true);
    }
  }, [width]);

  return (
    <div className="AfterLoginWindowDesktop">
      {/* 더미데이터 */}
      {/* 사용 완료시 삭제 */}
      {/* 더미데이터의 css는 App.css에 위치 */}
        {/* <RaspberryPiWebRTC /> */}
      {/* <div className="dumybox001">
        <Dum001 />
      </div> */}
      <div className="realtimevideoBox">
        <FlaskVideoStream />
      </div>
      <div className="listAndGraphWindowDesktop">
        <div className="listWindowDesktop">
          <h3>기록보기</h3>
          <ul className="DBlistSmall">
            {windowSizeTF == false
              ? Dum003.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                ) // 최신순 정렬
                  .slice(0, 6) // 최신 6개만 선택
                  .map((item, index) => (
                    <li key={index}>
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
              : Dum003.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                ) // 최신순 정렬
                  .slice(0, 6) // 최신 6개만 선택
                  .map((item, index) => (
                    <li key={index}>
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
          <button>더보기</button>
        </div>
        <div className="graphWindowDesktop">
          <DBGraph />
        </div>
      </div>
    </div>
  );
}

export default AfterLogin;
