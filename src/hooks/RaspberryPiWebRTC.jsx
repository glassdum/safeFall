import { useEffect, useRef, useState } from 'react';

function RaspberryPiWebRTC() {
  const remoteVideoRef = useRef(null);
  const [status, setStatus] = useState('연결 대기중...');
  const [pc, setPc] = useState(null);
  
  const RASPBERRY_PI_IP = '192.168.1.100'; // 라즈베리파이 IP 주소

  useEffect(() => {
    let peerConnection = null;

    const connectToStream = async () => {
      try {
        setStatus('연결 시도중...');

        // RTCPeerConnection 생성
        peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });

        // 원격 스트림 수신
        peerConnection.ontrack = (event) => {
          console.log('스트림 수신:', event.streams[0]);
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStatus('스트리밍 중');
          }
        };

        // 연결 상태 모니터링
        peerConnection.onconnectionstatechange = () => {
          console.log('연결 상태:', peerConnection.connectionState);
          switch(peerConnection.connectionState) {
            case 'connected':
              setStatus('연결됨');
              break;
            case 'disconnected':
              setStatus('연결 끊김');
              break;
            case 'failed':
              setStatus('연결 실패');
              reconnect();
              break;
          }
        };

        // Offer 생성 및 전송
        const offer = await peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: false
        });
        await peerConnection.setLocalDescription(offer);

        // mediamtx WebRTC 엔드포인트로 offer 전송
        const response = await fetch(`http://${RASPBERRY_PI_IP}:8889/cam/whep`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const answerSdp = await response.text();
        
        // Answer 설정
        await peerConnection.setRemoteDescription({
          type: 'answer',
          sdp: answerSdp
        });

        setPc(peerConnection);
        setStatus('연결 완료');

      } catch (error) {
        console.error('연결 오류:', error);
        setStatus(`오류: ${error.message}`);
      }
    };

    // 재연결 함수
    const reconnect = () => {
      setTimeout(() => {
        console.log('재연결 시도...');
        connectToStream();
      }, 3000);
    };

    connectToStream();

    // Cleanup
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  // 수동 재연결 버튼
  const handleReconnect = () => {
    if (pc) {
      pc.close();
    }
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📹 Libcamera WebRTC 스트림</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <span style={{
          padding: '8px 15px',
          backgroundColor: status === '스트리밍 중' ? '#4CAF50' : 
                          status.includes('오류') ? '#f44336' : '#FFC107',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          ● {status}
        </span>
      </div>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%', 
            maxWidth: '800px',
            backgroundColor: '#000',
            border: '2px solid #333',
            borderRadius: '8px',
            display: 'block'
          }}
        />
        
        {status === '연결 실패' && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <button
              onClick={handleReconnect}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              재연결
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
        <div>라즈베리파이: {RASPBERRY_PI_IP}:8889</div>
        <div>프로토콜: WebRTC (WHEP)</div>
      </div>
    </div>
  );
}

export default RaspberryPiWebRTC;