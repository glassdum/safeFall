import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function LiveVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const url = "http://43.203.245.90:8080/hls/stream.m3u8"; // EC2 HLS 주소

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari, iOS 네이티브 지원
      video.src = url;
    } else if (Hls.isSupported()) {
      // 크롬/파폭/엣지 → hls.js 사용
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      style={{ width: "100%", borderRadius: "8px", background: "#000" }}
    />
  );
}
