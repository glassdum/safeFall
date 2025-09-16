import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import WindowSize from "../hooks/windowSize";
import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

import "./CheckVideo.css";

function CheckVideo({
  incidentVideos = [],
  updateVideoCheckStatus,
  LiveVideoComponent,
}) {
  const { filename } = useParams(); // URL에서 파일명 파라미터 가져오기
  const navigate = useNavigate();
  const { width } = WindowSize();

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // URL 파라미터로 전달된 파일명으로 영상 데이터 찾기
  useEffect(() => {
    if (filename && incidentVideos.length > 0) {
      // URL 디코딩 (한글 파일명 처리)
      const decodedFilename = decodeURIComponent(filename);
      const foundVideo = incidentVideos.find(
        (video) => video.filename === decodedFilename
      );

      if (foundVideo) {
        setVideoData(foundVideo);
      } else {
        // 해당 영상을 찾을 수 없는 경우
        console.error("Video not found:", decodedFilename);
      }
      setLoading(false);
    }
  }, [filename, incidentVideos]);

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1); // 브라우저 히스토리에서 이전 페이지로
  };

  // 확인 상태 토글 핸들러
  const handleToggleCheck = () => {
    if (videoData && updateVideoCheckStatus) {
      const newCheckStatus = !videoData.isChecked;
      updateVideoCheckStatus(videoData.filename, newCheckStatus);

      // 로컬 상태도 업데이트
      setVideoData((prev) => ({
        ...prev,
        isChecked: newCheckStatus,
      }));
    }
  };

  // 영상 재생/정지 토글
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  // 파일 크기 가져오기 (더미 데이터)
  const getFileSize = () => {
    // 실제로는 백엔드에서 제공받을 데이터
    return `${Math.floor(Math.random() * 500 + 100)}MB`;
  };

  // 영상 길이 가져오기 (더미 데이터)
  const getVideoDuration = () => {
    // 실제로는 백엔드에서 제공받을 데이터
    const minutes = Math.floor(Math.random() * 10 + 1);
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="checkVideoPage">
        <div className="loading">
          <p>영상 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="checkVideoPage">
        <div className="notFound">
          <h2>영상을 찾을 수 없습니다</h2>
          <p>요청하신 영상이 존재하지 않거나 삭제되었습니다.</p>
          <button onClick={handleGoBack}>뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkVideoPage">
      {/* 헤더 */}
      <div className="videoHeader">
        <button
          className="backButton"
          onClick={handleGoBack}
          style={{
            border: "none",
            background: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <h1>영상 상세 정보</h1>
      </div>

      <div className="videoContent">
        {/* 영상 플레이어 영역 */}
        <div className="videoPlayerSection">
          <div className="videoPlayer">
            {isPlaying ? (
              // 실제 영상이 있다면 여기에 video 태그 또는 LiveVideoComponent 사용
              LiveVideoComponent ? (
                <LiveVideoComponent />
              ) : (
                <div className="videoPlaceholder">
                  <VideoBtnSmall />
                  <p>영상 재생 중...</p>
                </div>
              )
            ) : (
              <div className="videoThumbnail">
                <VideoBtnSmall />
                <div className="playButton" onClick={handlePlayToggle}>
                  ▶ 재생
                </div>
              </div>
            )}
          </div>

          {/* 영상 컨트롤 */}
          <div className="videoControls">
            <button
              className={`playBtn ${isPlaying ? "playing" : ""}`}
              onClick={handlePlayToggle}
            >
              {isPlaying ? "⏸ 정지" : "▶ 재생"}
            </button>
            <div className="videoProgress">
              <div className="progressBar">
                <div className="progress" style={{ width: "30%" }}></div>
              </div>
              <span className="timeInfo">01:30 / {getVideoDuration()}</span>
            </div>
          </div>
        </div>

        {/* 영상 정보 영역 */}
        <div className="videoInfoSection">
          <div className="videoInfo">
            <h2>{videoData.filename}</h2>

            <div className="infoGrid">
              <div className="infoItem">
                <label>생성 일시:</label>
                <span>{formatDate(videoData.createdAt)}</span>
              </div>

              <div className="infoItem">
                <label>파일 크기:</label>
                <span>{getFileSize()}</span>
              </div>

              <div className="infoItem">
                <label>영상 길이:</label>
                <span>{getVideoDuration()}</span>
              </div>

              <div className="infoItem">
                <label>해상도:</label>
                <span>1920 × 1080</span>
              </div>
            </div>

            {/* 확인 상태 섹션 */}
            <div className="checkStatusSection">
              <div className="statusInfo">
                <label>확인 상태:</label>
                <div
                  className={
                    videoData.isChecked
                      ? "statusBadge checked"
                      : "statusBadge unchecked"
                  }
                >
                  {videoData.isChecked ? "✓ 확인 완료" : "⏳ 확인 대기"}
                </div>
              </div>

              <button
                className={`toggleCheckBtn ${
                  videoData.isChecked ? "checked" : "unchecked"
                }`}
                onClick={handleToggleCheck}
              >
                {videoData.isChecked ? "미확인으로 변경" : "확인 완료로 변경"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckVideo;
