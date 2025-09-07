import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import WindowSize from "../hooks/windowSize";

import "./DBGraph.css"

import Dum003 from "../util/Dum003.json"

const DBGraph = () => {
  const { width, height } = WindowSize();
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="tooltip">
          <p className="tooltip-label">{`날짜: ${data.originalDate}`}</p>
          <p className="tooltip-entry">{`전체 영상: ${payload[0].value}개`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="video-count-chart">
      {/* 차트 */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              domain={[1, 12]}
              dataKey="xPosition"
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
              tickFormatter={(value) => `${String(Math.round(value)).padStart(2, '0')}`}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="전체 영상"
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 데이터 테이블 */}
      {
        width < 1200 ?
      <div className="data-table-container">
        <h3>월별 상세 데이터</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>전체</th>
                <th>확인됨</th>
                <th>미확인</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td className="date-cell">{row.date}</td>
                  <td className="count-cell">{row.total}개</td>
                  <td className="count-cell checked">{row.checked}개</td>
                  <td className="count-cell unchecked">{row.unchecked}개</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> : <div></div>}
    </div>
  );
};

export default DBGraph;