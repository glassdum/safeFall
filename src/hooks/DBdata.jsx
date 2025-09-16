
import { useMemo } from 'react';
import Dum003 from "../util/Dum003.json";

function useDBdata() {
  const dummyData = Dum003;

  // 그래프용 데이터 (기존 방식 유지)
  const chartData = useMemo(() => {
    // 실제 데이터를 일별로 집계
    const dailyData = {};
    
    dummyData.forEach(item => {
      const date = item.createdAt;
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          total: 0,
          checked: 0,
          unchecked: 0
        };
      }
      
      dailyData[date].total += 1;
      if (item.isChecked) {
        dailyData[date].checked += 1;
      } else {
        dailyData[date].unchecked += 1;
      }
    });

    // 일별 데이터를 월 좌표계로 변환
    const chartPoints = Object.values(dailyData).map(item => {
      const dateObj = new Date(item.date);
      const month = dateObj.getMonth() + 1; // 1~12
      const day = dateObj.getDate();
      const daysInMonth = new Date(2024, month, 0).getDate(); // 해당 월의 총 일수
      
      // 월 내에서의 위치 계산 (월 시작을 0, 월 끝을 1로 하는 비율)
      const positionInMonth = (day - 1) / (daysInMonth - 1);
      
      // 실제 X축 좌표 (월 번호 + 월 내 위치)
      const xPosition = month + positionInMonth - 1; // 1월을 1, 2월을 2로 시작
      
      return {
        date: `${String(month).padStart(2, '0')}월`,
        xPosition: xPosition,
        originalDate: item.date,
        total: item.total,
        checked: item.checked,
        unchecked: item.unchecked
      };
    });

    return chartPoints.sort((a, b) => a.xPosition - b.xPosition);
  }, [dummyData]);

  // 테이블용 월별 집계 데이터
  const tableData = useMemo(() => {
    // 월별 데이터 초기화 (1월~12월)
    const monthlyData = {};
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = {
        month: month,
        date: `${String(month).padStart(2, '0')}월`,
        total: 0,
        checked: 0,
        unchecked: 0
      };
    }
    
    // 실제 데이터를 월별로 집계
    dummyData.forEach(item => {
      const dateObj = new Date(item.createdAt);
      const month = dateObj.getMonth() + 1; // 1~12
      
      monthlyData[month].total += 1;
      if (item.isChecked) {
        monthlyData[month].checked += 1;
      } else {
        monthlyData[month].unchecked += 1;
      }
    });

    // 객체를 배열로 변환하고 월순으로 정렬
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  }, [dummyData]);

  // 원본 데이터와 가공된 데이터를 모두 반환
  return {
    rawData: dummyData,
    chartData,
    tableData
  };
}

export default useDBdata;

/*
import { useMemo, useState, useEffect } from 'react';
import { api } from '../utils/api';

function useDBdata() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 환경에 따라 실제 API 또는 Mock 데이터 사용
        const data = process.env.NODE_ENV === 'development' 
          ? await api.getMockVideoData()  // 개발 환경: Mock 데이터
          : await api.getVideoData();     // 프로덕션: 실제 API
          
        setRawData(data);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(err.message);
        // 에러 시 빈 배열로 설정하여 앱이 깨지지 않도록
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 그래프용 데이터 (기존 방식 유지)
  const chartData = useMemo(() => {
    if (!rawData.length) return [];
    
    // 실제 데이터를 일별로 집계
    const dailyData = {};
    
    rawData.forEach(item => {
      const date = item.createdAt;
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          total: 0,
          checked: 0,
          unchecked: 0
        };
      }
      
      dailyData[date].total += 1;
      if (item.isChecked) {
        dailyData[date].checked += 1;
      } else {
        dailyData[date].unchecked += 1;
      }
    });

    // 일별 데이터를 월 좌표계로 변환
    const chartPoints = Object.values(dailyData).map(item => {
      const dateObj = new Date(item.date);
      const month = dateObj.getMonth() + 1; // 1~12
      const day = dateObj.getDate();
      const daysInMonth = new Date(2024, month, 0).getDate(); // 해당 월의 총 일수
      
      // 월 내에서의 위치 계산 (월 시작을 0, 월 끝을 1로 하는 비율)
      const positionInMonth = (day - 1) / (daysInMonth - 1);
      
      // 실제 X축 좌표 (월 번호 + 월 내 위치)
      const xPosition = month + positionInMonth - 1; // 1월을 1, 2월을 2로 시작
      
      return {
        date: `${String(month).padStart(2, '0')}월`,
        xPosition: xPosition,
        originalDate: item.date,
        total: item.total,
        checked: item.checked,
        unchecked: item.unchecked
      };
    });

    return chartPoints.sort((a, b) => a.xPosition - b.xPosition);
  }, [rawData]);

  // 테이블용 월별 집계 데이터
  const tableData = useMemo(() => {
    if (!rawData.length) return [];
    
    // 월별 데이터 초기화 (1월~12월)
    const monthlyData = {};
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = {
        month: month,
        date: `${String(month).padStart(2, '0')}월`,
        total: 0,
        checked: 0,
        unchecked: 0
      };
    }
    
    // 실제 데이터를 월별로 집계
    rawData.forEach(item => {
      const dateObj = new Date(item.createdAt);
      const month = dateObj.getMonth() + 1; // 1~12
      
      monthlyData[month].total += 1;
      if (item.isChecked) {
        monthlyData[month].checked += 1;
      } else {
        monthlyData[month].unchecked += 1;
      }
    });

    // 객체를 배열로 변환하고 월순으로 정렬
    return Object.values(monthlyData).sort((a, b) => a.month - b.month);
  }, [rawData]);

  // 비디오 상태 업데이트 함수
  const updateVideoStatus = async (videoId, isChecked) => {
    try {
      await api.updateVideoStatus(videoId, isChecked);
      
      // 로컬 상태 업데이트
      setRawData(prevData => 
        prevData.map(item => 
          item.id === videoId ? { ...item, isChecked } : item
        )
      );
    } catch (err) {
      console.error('비디오 상태 업데이트 실패:', err);
      throw err;
    }
  };

  // 데이터 새로고침 함수
  const refreshData = async () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = process.env.NODE_ENV === 'development' 
          ? await api.getMockVideoData()
          : await api.getVideoData();
        setRawData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    await fetchData();
  };

  return {
    rawData,
    chartData,
    tableData,
    loading,
    error,
    updateVideoStatus,
    refreshData
  };
}

export default useDBdata;
*/