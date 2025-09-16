import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router 사용

import WindowSize from "../hooks/windowSize";

import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

import "./CheckHistory.css";

function CheckHistory({ 
  incidentVideos = [], 
  updateVideoCheckStatus,
  deleteIncidentVideo,
  getFilteredVideos,
  videoFilters,
  updateFilters,
  resetFilters,
  getVideoStats 
}) {
  const { width } = WindowSize();
  const navigate = useNavigate(); // React Router의 useNavigate 사용
  const [currentPage, setCurrentPage] = useState(1);

  // 영상 클릭 핸들러 (상세 페이지로 이동)
  const handleVideoClick = (filename) => {
    const encodedFilename = encodeURIComponent(filename);
    navigate(`/video/${encodedFilename}`);
  };
  
  // 화면 크기에 따른 페이지당 아이템 수
  const itemsPerPage = width >= 1200 ? 8 : 6;
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(incidentVideos.length / itemsPerPage);
  
  // 현재 페이지의 데이터 가져오기
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return incidentVideos
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 최신순 정렬
      .slice(startIndex, endIndex);
  };

  // 페이지 변경 함수
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 이전 페이지
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 다음 페이지
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 화면 크기가 변경될 때 페이지 재조정
  useEffect(() => {
    const newTotalPages = Math.ceil(incidentVideos.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [width, incidentVideos.length, itemsPerPage, currentPage]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year} / ${month} / ${day}`;
  };

  return (
    <div className="CheckHistorySection">
      <div className="historyListBox">
        <ul className="historyLost">
          {getCurrentPageData().map((item, index) => (
            <li 
              key={`${item.filename}-${item.createdAt}-${index}`}
              onClick={() => handleVideoClick(item.filename)}
              style={{ cursor: 'pointer' }}
            >
              <div className="historyThumnail">
                <VideoBtnSmall />
              </div>
              <div className="historyinfo">
                <h3 className="historyFilename">{item.filename}</h3>
                <div className="historyDetailBox">
                  <p className="historycreatedAt">
                    {formatDate(item.createdAt)}
                  </p>
                  <div className="historyCheckbox">
                    <p>확인 여부</p>
                    <div
                      className={
                        item.isChecked
                          ? "checkBoxSmall checkFinish"
                          : "checkBoxSmall checkPrev"
                      }
                    >
                      {item.isChecked ? "완료" : "대기"}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="historyListBoxBtn">
          <div className="pagination">
            {/* 이전 페이지 버튼 */}
            <button 
              className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              &#8249;
            </button>
            
            {/* 페이지 번호들 */}
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            
            {/* 다음 페이지 버튼 */}
            <button 
              className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              &#8250;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckHistory;