/**
 * API 서비스 클래스
 * 백엔드 API와의 모든 통신을 담당합니다.
 */

import httpClient from '../util/httpClient.js';
import { 
  API_ENDPOINTS, 
  buildApiUrl, 
  buildQueryString, 
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  debugLog 
} from '../config/api.js';

class ApiService {
  /**
   * ===================
   * 인증 관련 API
   * ===================
   */

  /**
   * 로그인
   * @param {Object} credentials - 로그인 정보
   * @param {string} credentials.username - 사용자명
   * @param {string} credentials.password - 비밀번호
   * @returns {Promise<Object>} 인증 토큰 및 사용자 정보
   */
  async login(credentials) {
    try {
      debugLog('Login attempt:', { username: credentials.username });
      
      const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.username,
        password: credentials.password
      });

      // 토큰 저장
      if (response.accessToken) {
        httpClient.setAuthToken(response.accessToken);
      }
      if (response.refreshToken) {
        httpClient.setRefreshToken(response.refreshToken);
      }

      debugLog('Login successful');
      return response;

    } catch (error) {
      debugLog('Login failed:', error.message);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async logout() {
    try {
      debugLog('Logout attempt');
      
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // 로컬 토큰 삭제
      httpClient.clearAuthTokens();
      
      debugLog('Logout successful');
      
    } catch (error) {
      debugLog('Logout failed:', error.message);
      // 로그아웃 실패해도 로컬 토큰은 삭제
      httpClient.clearAuthTokens();
      throw error;
    }
  }

  /**
   * 세션 확인
   */
  async checkSession() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.AUTH.CHECK_SESSION, {
        cache: true,
        cacheTime: 30 * 1000 // 30초 캐시
      });
      return response;
    } catch (error) {
      debugLog('Session check failed:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 영상 관련 API
   * ===================
   */

  /**
   * 영상 목록 조회
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.limit - 페이지 크기
   * @param {string} params.search - 검색어
   * @param {boolean} params.isChecked - 확인 상태 필터
   * @param {string} params.sortBy - 정렬 기준
   * @param {string} params.sortOrder - 정렬 순서 (asc, desc)
   * @returns {Promise<Object>} 영상 목록 및 페이지네이션 정보
   */
  async getVideos(params = {}) {
    try {
      const queryParams = {
        page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: params.limit || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };

      // 선택적 파라미터 추가
      if (params.search) queryParams.search = params.search;
      if (params.isChecked !== undefined) queryParams.isChecked = params.isChecked;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const queryString = buildQueryString(queryParams);
      const url = `${API_ENDPOINTS.VIDEOS.LIST}${queryString}`;

      debugLog('Fetching videos:', queryParams);

      const response = await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.VIDEO_LIST_CACHE_TIME
      });

      debugLog('Videos fetched:', { count: response.data?.length || 0 });
      return response;

    } catch (error) {
      debugLog('Failed to fetch videos:', error.message);
      throw error;
    }
  }

  /**
   * 영상 상세 정보 조회
   * @param {string} videoId - 영상 ID 또는 파일명
   * @returns {Promise<Object>} 영상 상세 정보
   */
  async getVideoDetail(videoId) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DETAIL, { id: videoId });
      
      debugLog('Fetching video detail:', { videoId });

      const response = await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.DEFAULT_CACHE_TIME
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch video detail:', error.message);
      throw error;
    }
  }

  /**
   * 영상 확인 상태 업데이트
   * @param {string} videoId - 영상 ID 또는 파일명
   * @param {boolean} isChecked - 확인 상태
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateVideoStatus(videoId, isChecked) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.STATUS, { id: videoId });
      
      debugLog('Updating video status:', { videoId, isChecked });

      const response = await httpClient.patch(url, { isChecked });

      // 관련 캐시 삭제
      httpClient.clearCache('videos');

      debugLog('Video status updated successfully');
      return response;

    } catch (error) {
      debugLog('Failed to update video status:', error.message);
      throw error;
    }
  }

  /**
   * 영상 삭제
   * @param {string} videoId - 영상 ID 또는 파일명
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteVideo(videoId) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DELETE, { id: videoId });
      
      debugLog('Deleting video:', { videoId });

      const response = await httpClient.delete(url);

      // 관련 캐시 삭제
      httpClient.clearCache('videos');

      debugLog('Video deleted successfully');
      return response;

    } catch (error) {
      debugLog('Failed to delete video:', error.message);
      throw error;
    }
  }

  /**
   * 영상 다운로드
   * @param {string} videoId - 영상 ID 또는 파일명
   * @param {string} filename - 다운로드할 파일명
   * @returns {Promise<Blob>} 다운로드된 파일
   */
  async downloadVideo(videoId, filename = null) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DOWNLOAD, { id: videoId });
      
      debugLog('Downloading video:', { videoId, filename });

      // httpClient.download → 제거됨
      const response = await httpClient.get(url, {
        responseType: 'blob'
      });

      // 파일 저장이 필요하면 여기서 Blob 처리
      if (filename) {
        const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      debugLog('Video downloaded successfully');
      return response;

    } catch (error) {
      debugLog('Failed to download video:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 실시간 스트리밍 관련 API
   * ===================
   */

  /**
   * 실시간 스트림 URL 조회
   * @returns {Promise<Object>} 스트림 정보
   */
  async getLiveStream() {
    try {
      debugLog('Fetching live stream info');

      const response = await httpClient.get(API_ENDPOINTS.STREAM.LIVE, {
        cache: true,
        cacheTime: 30 * 1000 // 30초 캐시
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch live stream:', error.message);
      throw error;
    }
  }

  /**
   * 스트림 상태 조회
   * @returns {Promise<Object>} 스트림 상태
   */
  async getStreamStatus() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.STREAM.STATUS);
      return response;
    } catch (error) {
      debugLog('Failed to fetch stream status:', error.message);
      throw error;
    }
  }

  /**
   * 스트림 시작
   * @returns {Promise<Object>} 시작 결과
   */
  async startStream() {
    try {
      debugLog('Starting stream');

      const response = await httpClient.post(API_ENDPOINTS.STREAM.START);

      debugLog('Stream started successfully');
      return response;

    } catch (error) {
      debugLog('Failed to start stream:', error.message);
      throw error;
    }
  }

  /**
   * 스트림 중지
   * @returns {Promise<Object>} 중지 결과
   */
  async stopStream() {
    try {
      debugLog('Stopping stream');

      const response = await httpClient.post(API_ENDPOINTS.STREAM.STOP);

      debugLog('Stream stopped successfully');
      return response;

    } catch (error) {
      debugLog('Failed to stop stream:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 대시보드 관련 API
   * ===================
   */

  /**
   * 대시보드 통계 조회
   * @returns {Promise<Object>} 통계 데이터
   */
  async getDashboardStats() {
    try {
      debugLog('Fetching dashboard stats');

      const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.STATS, {
        cache: true,
        cacheTime: CACHE_CONFIG.STATS_CACHE_TIME
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * 최근 영상 조회
   * @param {number} limit - 조회할 개수
   * @returns {Promise<Object>} 최근 영상 목록
   */
  async getRecentVideos(limit = 6) {
    try {
      const queryString = buildQueryString({ limit });
      const url = `${API_ENDPOINTS.DASHBOARD.RECENT_VIDEOS}${queryString}`;

      debugLog('Fetching recent videos:', { limit });

      const response = await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.VIDEO_LIST_CACHE_TIME
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch recent videos:', error.message);
      throw error;
    }
  }

  /**
   * 차트 데이터 조회
   * @param {Object} params - 쿼리 파라미터
   * @param {string} params.period - 조회 기간 (day, week, month, year)
   * @param {string} params.startDate - 시작 날짜
   * @param {string} params.endDate - 종료 날짜
   * @returns {Promise<Object>} 차트 데이터
   */
  async getChartData(params = {}) {
    try {
      const queryParams = {
        period: params.period || 'month'
      };

      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const queryString = buildQueryString(queryParams);
      const url = `${API_ENDPOINTS.DASHBOARD.CHART_DATA}${queryString}`;

      debugLog('Fetching chart data:', queryParams);

      const response = await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.STATS_CACHE_TIME
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch chart data:', error.message);
      throw error;
    }
  }

    /**
   * 영상 파일 업로드
   * @param {File} file - 업로드할 파일
   * @param {Function} onProgress - 진행률 콜백
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadVideo(file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('filename', file.name);
      formData.append('size', file.size);

      debugLog('Uploading video:', { 
        filename: file.name, 
        size: file.size, 
        type: file.type 
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            debugLog('Video uploaded successfully');
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'));
        });

        xhr.open('POST', `${httpClient.baseURL}${API_ENDPOINTS.UPLOAD.VIDEO}`);
        
        // 인증 헤더 추가
        const token = httpClient.getAuthToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });

    } catch (error) {
      debugLog('Failed to upload video:', error.message);
      throw error;
    }
  }
  /**
   * ===================
   * 설정 관련 API
   * ===================
   */

  /**
   * 시스템 설정 조회
   * @returns {Promise<Object>} 설정 정보
   */
  async getSettings() {
    try {
      debugLog('Fetching settings');

      const response = await httpClient.get(API_ENDPOINTS.SETTINGS.GENERAL, {
        cache: true,
        cacheTime: CACHE_CONFIG.DEFAULT_CACHE_TIME
      });

      return response;

    } catch (error) {
      debugLog('Failed to fetch settings:', error.message);
      throw error;
    }
  }

  /**
   * 시스템 설정 업데이트
   * @param {Object} settings - 업데이트할 설정
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateSettings(settings) {
    try {
      debugLog('Updating settings:', settings);

      const response = await httpClient.put(API_ENDPOINTS.SETTINGS.GENERAL, settings);

      // 설정 캐시 삭제
      httpClient.clearCache('settings');

      debugLog('Settings updated successfully');
      return response;

    } catch (error) {
      debugLog('Failed to update settings:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 헬스체크 및 유틸리티
   * ===================
   */

  /**
   * API 서버 상태 확인
   * @returns {Promise<Object>} 서버 상태
   */
  async healthCheck() {
    try {
      const response = await httpClient.get('/health');
      return response;
    } catch (error) {
      debugLog('Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * 캐시 전체 삭제
   */
  clearAllCache() {
    httpClient.clearCache();
    debugLog('All cache cleared');
  }

  /**
   * 특정 패턴의 캐시 삭제
   * @param {string} pattern - 삭제할 캐시 패턴
   */
  clearCacheByPattern(pattern) {
    httpClient.clearCache(pattern);
    debugLog('Cache cleared for pattern:', pattern);
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const apiService = new ApiService();
export default apiService;