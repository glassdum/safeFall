import { useEffect, useRef } from 'react';

function FlaskVideoStream() {
  const videoRef = useRef(null);
  // ✅ 하드코딩 제거, 환경변수로 치환(없으면 비활성화)
  const FLASK_SERVER_URL = import.meta.env.VITE_FLASK_URL || "";

  useEffect(() => {
    // 운영(prod)에서 접근 불가하면 빈 값으로 배포 → 폴링 자체를 시작하지 않음
    if (!FLASK_SERVER_URL) return;

    let intervalId = null;
    let isActive = true;

    const fetchFrame = async () => {
      if (!isActive) return;
      try {
        const response = await fetch(`${FLASK_SERVER_URL}/current_frame`);
        if (response.ok) {
          const data = await response.json();
          if (data?.frame && videoRef.current) {
            videoRef.current.src = `data:image/jpeg;base64,${data.frame}`;
          }
        }
      } catch (_) {
        // 네트워크 오류 시 조용히 무시(콘솔 스팸 방지)
      }
    };

    const startStreaming = async () => {
      try {
        const response = await fetch(`${FLASK_SERVER_URL}/status`);
        if (response.ok) {
          intervalId = setInterval(fetchFrame, 200); // 기존 주기 그대로
        }
      } catch (_) {
        // 접근 불가(내부망/타임아웃 등) → 조용히 무시
      }
    };

    startStreaming();

    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [FLASK_SERVER_URL]);

  // 운영에서 비활성화(빈 값)일 때: 기존 UI를 크게 바꾸지 않고 placeholder만 노출
  if (!FLASK_SERVER_URL) {
    return (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #eee'
        }}
      >
        <span style={{ opacity: 0.7, fontSize: 14 }}>
          실시간 스트림이 비활성화되어 있습니다.
        </span>
      </div>
    );
  }

  return (
    <img
      ref={videoRef}
      alt="라즈베리파이 스트림"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default FlaskVideoStream;
