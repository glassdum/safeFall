import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import WindowSize from "../hooks/windowSize";
import VideoBtnSmall from "../components/SVG-VideoBtnSmall";

import apiService from "../services/api"; // ← (선택) 서버 사전검증용
import "./CheckHistory.css";

function CheckHistory({
  incidentVideos = [],
  updateVideoCheckStatus,
  deleteIncidentVideo,
  getFilteredVideos,
  videoFilters,
  updateFilters,
  resetFilters,
  getVideoStats,
}) {
  const { width } = WindowSize();
  const navigate = useNavigate();

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);

  // 클릭/에러 상태
  const [clickingKey, setClickingKey] = useState(null); // id 또는 filename으로 식별
  const [errorMsg, setErrorMsg] = useState("");

  // 화면 크기에 따른 페이지당 아이템 수
  const itemsPerPage = width >= 1200 ? 8 : 6;

  // 총 페이지 수
  const totalPages = Math.ceil((incidentVideos?.length ?? 0) / itemsPerPage);

  // (성능) 정렬된 원본 메모
  const sortedVideos = useMemo(() => {
    return (incidentVideos ?? [])
      .slice()
      .sort((a, b) => {
        const tb = Date.parse(b?.createdAt ?? 0) || 0;
        const ta = Date.parse(a?.createdAt ?? 0) || 0;
        return tb - ta; // 최신순
      });
  }, [incidentVideos]);

  // 현재 페이지 데이터
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedVideos.slice(startIndex, endIndex);
  };

  // 페이지 이동
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // 화면 크기/데이터 변경 시 페이지 보정
  useEffect(() => {
    const newTotalPages = Math.ceil((incidentVideos?.length ?? 0) / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [width, incidentVideos?.length, itemsPerPage, currentPage]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "날짜 정보 없음";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year} / ${month} / ${day}`;
  };

  // (선택) 서버에 존재하는지 확인하는 보조 함수
  const checkVideoExists = async ({ id, filename }) => {
    // apiService에 대응 메서드가 있는 경우에만 시도 (duck-typing)
    try {
      if (id && typeof apiService?.getVideoById === "function") {
        const res = await apiService.getVideoById(id);
        return !!res?.data;
      }
      if (filename && typeof apiService?.getVideoMetaByFilename === "function") {
        const res = await apiService.getVideoMetaByFilename(filename);
        return !!res?.data;
      }
      // 메서드가 없다면 서버 사전검증은 생략하고 프론트 단으로 통과
      return true;
    } catch {
      return false; // 404/에러 → 존재하지 않음 처리
    }
  };

  // 영상 클릭(사전 검증 + 이동)
  const handleVideoClick = async (item) => {
    try {
      setErrorMsg("");

      // 연속 클릭 방지
      if (clickingKey) return;

      // 필수 키 검사 (id 또는 filename 중 하나는 필요)
      const key = item?.id ?? item?.filename;
      if (!key) {
        throw new Error("NO_KEY");
      }
      setClickingKey(key);

      // (선택) 서버 사전검증
      const exists = await checkVideoExists({
        id: item?.id,
        filename: item?.filename,
      });

      if (!exists) {
        throw new Error("NOT_FOUND");
      }

      // 라우팅 키: id 우선, 없으면 filename 사용
      const target =
        item?.id != null
          ? `/video/${encodeURIComponent(String(item.id))}`
          : `/video/${encodeURIComponent(String(item.filename))}`;

      navigate(target);
    } catch (e) {
      // 공통 에러 메시지
      setErrorMsg(
        "영상을 찾을 수 없습니다\n요청하신 영상이 존재하지 않거나 삭제되었습니다."
      );
      // 필요시 토스트/모달로 교체 가능: window.alert(errorMsg);
    } finally {
      setClickingKey(null);
    }
  };

  // 키보드 접근(Enter/Space)
  const onItemKeyDown = (e, item) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleVideoClick(item);
    }
  };

  return (
    <div className="CheckHistorySection">
      {/* 에러 배너 */}
      {errorMsg && (
        <div className="historyError" role="alert" aria-live="assertive">
          {errorMsg.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="historyListBox">
        <ul className="historyLost">
          {getCurrentPageData().map((item, index) => {
            const rowKey = `${item?.id ?? item?.filename ?? "unknown"}-${item?.createdAt ?? index}-${index}`;
            const disabled = clickingKey && clickingKey === (item?.id ?? item?.filename);

            return (
              <li
                key={rowKey}
                onClick={() => handleVideoClick(item)}
                onKeyDown={(e) => onItemKeyDown(e, item)}
                role="button"
                tabIndex={0}
                aria-disabled={disabled ? "true" : "false"}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <div className="historyThumnail">
                  <VideoBtnSmall />
                </div>
                <div className="historyinfo">
                  <h3 className="historyFilename">
                    {item?.filename ?? "(파일명 없음)"}
                  </h3>
                  <div className="historyDetailBox">
                    <p className="historycreatedAt">
                      {formatDate(item?.createdAt)}
                    </p>
                    <div className="historyCheckbox">
                      <p>확인 여부</p>
                      <div
                        className={
                          item?.isChecked
                            ? "checkBoxSmall checkFinish"
                            : "checkBoxSmall checkPrev"
                        }
                      >
                        {item?.isChecked ? "완료" : "대기"}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="historyListBoxBtn">
          <div className="pagination">
            <button
              className={`pagination-arrow ${currentPage === 1 ? "disabled" : ""}`}
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              &#8249;
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                )
              )}
            </div>

            <button
              className={`pagination-arrow ${
                currentPage === totalPages ? "disabled" : ""
              }`}
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
