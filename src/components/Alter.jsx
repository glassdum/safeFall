import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Alter.css";

function Alert({ 
  isVisible = false, 
  onClose, 
  alertData = {} 
}) {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  // 알람이 표시될 때 애니메이션 시작
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // TODO: 알림음 재생 기능 추가 예정
      // playAlertSound();
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  // TODO: 알림음 재생 함수 (향후 구현)
  // const playAlertSound = () => {
  //   try {
  //     const audio = new Audio('/sounds/alert.mp3');
  //     audio.play();
  //   } catch (error) {
  //     console.warn('Alert sound failed to play:', error);
  //   }
  // };

  // 알람 닫기 핸들러
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // 애니메이션 완료 후 닫기
  };

  // 기록보기 페이지로 이동
  const handleGoToHistory = () => {
    navigate('/history');
    handleClose(); // 페이지 이동 후 알람 닫기
  };

  // ESC 키로 알람 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible]);

  // 알람이 보이지 않으면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`alert-overlay ${isAnimating ? 'show' : ''}`}>
      <div className={`alert-modal ${isAnimating ? 'animate' : ''}`}>
        
        {/* 알람 헤더 */}
        <div className="alert-header">
          <div className="alert-icon">
            ⚠️
          </div>
          <h2 className="alert-title">낙상 감지 알람</h2>
        </div>

        {/* 알람 내용 */}
        <div className="alert-content">
          <p className="alert-message">
            {alertData.type === 'fall' ? '낙상이 감지되었습니다!' : 
             alertData.type === 'frame' ? '이상 상황이 감지되었습니다!' : 
             '알림이 도착했습니다!'}
          </p>
          
          <div className="alert-details">
            <div className="detail-item">
              <span className="detail-label">감지 시간:</span>
              <span className="detail-value">
                {alertData.createdAt ? 
                  new Date(alertData.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }) : 
                  new Date().toLocaleString('ko-KR')
                }
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">카메라:</span>
              <span className="detail-value">
                {alertData.device_id ? 
                  alertData.device_id.replace('camera_', '카메라 ').replace('_', ' ') : 
                  "알 수 없음"}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">유형:</span>
              <span className={`detail-value event-type ${alertData.type || 'fall'}`}>
                {alertData.type === 'fall' ? '🚨 낙상' : 
                 alertData.type === 'frame' ? '📷 일반' : 
                 alertData.type === 'normal' ? '✅ 정상' : '❓ 기타'}
              </span>
            </div>

            {alertData.filename && (
              <div className="detail-item">
                <span className="detail-label">파일명:</span>
                <span className="detail-value filename">
                  {alertData.filename}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 알람 버튼들 */}
        <div className="alert-buttons">
          <button 
            className="alert-btn alert-btn-secondary"
            onClick={handleClose}
          >
            알람 끄기
          </button>
          
          <button 
            className="alert-btn alert-btn-primary"
            onClick={handleGoToHistory}
          >
            기록 확인하기
          </button>
        </div>

        {/* 닫기 X 버튼 */}
        <button 
          className="alert-close-x"
          onClick={handleClose}
          aria-label="알람 닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Alert;