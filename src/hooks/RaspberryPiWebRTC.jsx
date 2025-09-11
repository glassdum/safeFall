import { useEffect, useRef } from 'react';

function FlaskVideoStream() {
  const videoRef = useRef(null);
  const FLASK_SERVER_URL = 'http://192.168.0.6:5000';

  useEffect(() => {
    let intervalId = null;
    let isActive = true;

    const fetchFrame = async () => {
      if (!isActive) return;

      try {
        const response = await fetch(`${FLASK_SERVER_URL}/current_frame`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.frame && videoRef.current) {
            const imageUrl = `data:image/jpeg;base64,${data.frame}`;
            videoRef.current.src = imageUrl;
          }
        }
      } catch (error) {
        console.error('프레임 가져오기 오류:', error);
      }
    };

    const startStreaming = async () => {
      try {
        const response = await fetch(`${FLASK_SERVER_URL}/status`);
        if (response.ok) {
          intervalId = setInterval(fetchFrame, 200);
        }
      } catch (error) {
        console.error('서버 연결 오류:', error);
      }
    };

    startStreaming();

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <img
      ref={videoRef}
      alt="라즈베리파이 스트림"
      style={{
        width : '100%',
        height : '100%'
      }}
    />
  );
}

export default FlaskVideoStream;