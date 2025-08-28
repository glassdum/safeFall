import { useEffect, useRef, useState } from 'react';

function RaspberryPiWebRTC() {
  const remoteVideoRef = useRef(null);
  const [status, setStatus] = useState('연결 대기중...');
  
  // 라즈베리파이 IP 주소 설정
  const RASPBERRY_PI_IP = '192.168.1.100'; // 실제 라즈베리파이 IP로 변경하세요

  useEffect(() => {
    let pc = null;
    let ws = null;

    const connectToRaspberryPi = async () => {
      try {
        // RTCPeerConnection 생성
        pc = new RTCPeerConnection({
          iceServers: [
            // 로컬 네트워크만 사용한다면 비워도 됨
            // 외부 접속이 필요하면 그대로 사용
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });

        // 연결 상태 모니터링
        pc.onconnectionstatechange = () => {
          console.log('연결 상태:', pc.connectionState);
          setStatus(`연결 상태: ${pc.connectionState}`);
        };

        // ICE 연결 상태 모니터링
        pc.oniceconnectionstatechange = () => {
          console.log('ICE 상태:', pc.iceConnectionState);
        };

        // 원격 스트림 수신
        pc.ontrack = (event) => {
          console.log('스트림 수신됨:', event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStatus('스트림 연결됨!');
          }
        };

        // UV4L WebSocket 연결
        // UV4L 기본 포트는 8090
        ws = new WebSocket(`ws://${RASPBERRY_PI_IP}:8090/stream/webrtc`);
        
        ws.onopen = () => {
          console.log('WebSocket 연결됨');
          setStatus('WebSocket 연결됨');
        };

        ws.onerror = (error) => {
          console.error('WebSocket 에러:', error);
          setStatus('연결 실패');
        };

        ws.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('메시지 수신:', message.type);
            
            if (message.type === 'offer' || message.offer) {
              // Offer 수신 및 처리
              const offer = message.offer || message;
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              
              // Answer 생성
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              // Answer 전송
              ws.send(JSON.stringify({
                type: 'answer',
                answer: answer
              }));
              
              console.log('Answer 전송됨');
            } else if (message.type === 'ice-candidate' || message.candidate) {
              // ICE candidate 추가
              const candidate = message.candidate || message;
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log('ICE candidate 추가됨');
            }
          } catch (error) {
            console.error('메시지 처리 에러:', error);
          }
        };

        // ICE candidate 전송
        pc.onicecandidate = (event) => {
          if (event.candidate && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate
            }));
            console.log('ICE candidate 전송됨');
          }
        };

      } catch (error) {
        console.error('연결 실패:', error);
        setStatus('연결 실패: ' + error.message);
      }
    };

    connectToRaspberryPi();

    // Cleanup
    return () => {
      if (pc) {
        pc.close();
        console.log('PeerConnection 종료');
      }
      if (ws) {
        ws.close();
        console.log('WebSocket 종료');
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎥 라즈베리파이 카메라 스트림</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <span style={{
          padding: '5px 10px',
          backgroundColor: status.includes('연결됨') ? '#4CAF50' : '#FFC107',
          color: 'white',
          borderRadius: '5px'
        }}>
          {status}
        </span>
      </div>

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
          borderRadius: '8px'
        }}
      />

      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        라즈베리파이 IP: {RASPBERRY_PI_IP}
      </div>
    </div>
  );
}

export default RaspberryPiWebRTC;