import { createContext, useContext, useState } from 'react';

// 더미데이터 imports
import Dum001 from './dum001';
import Dum003Data from '../util/Dum003.json';
import Dum004Data from '../util/Dum004.json';

// DataContext 생성
const DataContext = createContext();

// DataProvider 컴포넌트
export const DataProvider = ({ children }) => {
  // 1. 실시간 영상 컴포넌트 (Dum001.jsx 사용)
  const [LiveVideoComponent] = useState(() => Dum001);
  const [liveVideoConfig, setLiveVideoConfig] = useState({
    isVisible: true,
    streamStatus: "online", // online, offline, error
    lastUpdated: new Date().toISOString(),
    title: "Live Security Camera Feed"
  });

  // 2. 사고 영상 기록 데이터 (Dum003.json)
  const [incidentVideos, setIncidentVideos] = useState(Dum003Data);

  // 3. 사용자 로그인 데이터 (Dum004.json)
  const [userCredentials] = useState(Dum004Data);

  // 4. 필터링 및 검색 상태
  const [videoFilters, setVideoFilters] = useState({
    showCheckedOnly: false,
    showUncheckedOnly: false,
    dateRange: {
      start: null,
      end: null
    },
    searchKeyword: ""
  });

  // === 실시간 영상 관련 함수들 ===
  const updateLiveVideoConfig = (newConfig) => {
    setLiveVideoConfig(prev => ({
      ...prev,
      ...newConfig,
      lastUpdated: new Date().toISOString()
    }));
  };

  const updateStreamStatus = (status) => {
    setLiveVideoConfig(prev => ({
      ...prev,
      streamStatus: status,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Dum001 컴포넌트를 반환하는 함수
  const getLiveVideoComponent = () => {
    return LiveVideoComponent;
  };

  // === 사고 영상 관련 함수들 ===
  const updateVideoCheckStatus = (filename, isChecked) => {
    setIncidentVideos(prev => 
      prev.map(video => 
        video.filename === filename 
          ? { ...video, isChecked } 
          : video
      )
    );
  };

  const addNewIncidentVideo = (videoData) => {
    const newVideo = {
      filename: videoData.filename,
      createdAt: videoData.createdAt || new Date().toISOString().split('T')[0],
      isChecked: false
    };
    setIncidentVideos(prev => [newVideo, ...prev]);
  };

  const deleteIncidentVideo = (filename) => {
    setIncidentVideos(prev => 
      prev.filter(video => video.filename !== filename)
    );
  };

  // === 로그인 관련 함수들 ===
  const validateCredentials = (inputId, inputPassword) => {
    return userCredentials.some(user => 
      user.id === inputId && user.pw === inputPassword
    );
  };

  const getUserByCredentials = (inputId, inputPassword) => {
    return userCredentials.find(user => 
      user.id === inputId && user.pw === inputPassword
    );
  };

  // === 필터링 및 검색 함수들 ===
  const getFilteredVideos = () => {
    let filtered = [...incidentVideos];

    // 확인 상태 필터
    if (videoFilters.showCheckedOnly) {
      filtered = filtered.filter(video => video.isChecked);
    } else if (videoFilters.showUncheckedOnly) {
      filtered = filtered.filter(video => !video.isChecked);
    }

    // 날짜 범위 필터
    if (videoFilters.dateRange.start && videoFilters.dateRange.end) {
      filtered = filtered.filter(video => {
        const videoDate = new Date(video.createdAt);
        const startDate = new Date(videoFilters.dateRange.start);
        const endDate = new Date(videoFilters.dateRange.end);
        return videoDate >= startDate && videoDate <= endDate;
      });
    }

    // 검색 키워드 필터
    if (videoFilters.searchKeyword) {
      filtered = filtered.filter(video =>
        video.filename.toLowerCase().includes(videoFilters.searchKeyword.toLowerCase())
      );
    }

    return filtered;
  };

  const updateFilters = (newFilters) => {
    setVideoFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setVideoFilters({
      showCheckedOnly: false,
      showUncheckedOnly: false,
      dateRange: { start: null, end: null },
      searchKeyword: ""
    });
  };

  // === 통계 정보 함수들 ===
  const getVideoStats = () => {
    const total = incidentVideos.length;
    const checked = incidentVideos.filter(v => v.isChecked).length;
    const unchecked = total - checked;
    
    return {
      total,
      checked,
      unchecked,
      checkRate: total > 0 ? Math.round((checked / total) * 100) : 0
    };
  };

  const getRecentVideos = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return incidentVideos.filter(video => 
      new Date(video.createdAt) >= cutoffDate
    ).length;
  };

  // Context Value
  const contextValue = {
    // 데이터
    LiveVideoComponent,
    liveVideoConfig,
    incidentVideos,
    userCredentials,
    videoFilters,
    
    // 실시간 영상 함수들
    getLiveVideoComponent,
    updateLiveVideoConfig,
    updateStreamStatus,
    
    // 사고 영상 함수들
    updateVideoCheckStatus,
    addNewIncidentVideo,
    deleteIncidentVideo,
    getFilteredVideos,
    
    // 로그인 함수들
    validateCredentials,
    getUserByCredentials,
    
    // 필터링 함수들
    updateFilters,
    resetFilters,
    
    // 통계 함수들
    getVideoStats,
    getRecentVideos
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// DataContext 사용을 위한 커스텀 훅
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;