/**
 * API 서비스 클래스
 * 백엔드 API와의 모든 통신을 담당합니다.
 */
// 경로 => "../src/services/api.js"
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

  async login(credentials) {
    try {
      debugLog('Login attempt:', { username: credentials.username });
      
      const response = await httpClient.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
        username: credentials.username,
        password: credentials.password
      });

      if (response.accessToken) httpClient.setAuthToken(response.accessToken);
      if (response.refreshToken) httpClient.setRefreshToken(response.refreshToken);

      debugLog('Login successful');
      return response;

    } catch (error) {
      debugLog('Login failed:', error.message);
      throw error;
    }
  }

  async logout() {
    try {
      debugLog('Logout attempt');
      await httpClient.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT));
      httpClient.clearAuthTokens();
      debugLog('Logout successful');
    } catch (error) {
      debugLog('Logout failed:', error.message);
      httpClient.clearAuthTokens();
      throw error;
    }
  }

  async checkSession() {
    try {
      const response = await httpClient.get(buildApiUrl(API_ENDPOINTS.AUTH.CHECK_SESSION), {
        cache: true,
        cacheTime: 30 * 1000
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

  async getVideos(params = {}) {
    try {
      const queryParams = {
        page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: params.limit || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };

      if (params.search) queryParams.search = params.search;
      if (params.isChecked !== undefined) queryParams.isChecked = params.isChecked;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.type) queryParams.type = params.type;

      const queryString = buildQueryString(queryParams);
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.LIST) + queryString;

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

  async getVideoDetail(videoId) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DETAIL, { id: videoId });
      debugLog('Fetching video detail:', { videoId });
      return await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.DEFAULT_CACHE_TIME
      });
    } catch (error) {
      debugLog('Failed to fetch video detail:', error.message);
      throw error;
    }
  }

  async updateVideoStatus(videoId, isChecked) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.STATUS, { id: videoId });
      debugLog('Updating video status:', { videoId, isChecked });
      const response = await httpClient.patch(url, { isChecked });
      httpClient.clearCache('videos');
      return response;
    } catch (error) {
      debugLog('Failed to update video status:', error.message);
      throw error;
    }
  }

  async deleteVideo(videoId) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DELETE, { id: videoId });
      debugLog('Deleting video:', { videoId });
      const response = await httpClient.delete(url);
      httpClient.clearCache('videos');
      return response;
    } catch (error) {
      debugLog('Failed to delete video:', error.message);
      throw error;
    }
  }

  async downloadVideo(videoId, filename = null) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.VIDEOS.DOWNLOAD, { id: videoId });
      const response = await httpClient.get(url, { responseType: 'blob' });

      if (filename) {
        const blob = new Blob([response], { type: response.type || 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return response;
    } catch (error) {
      debugLog('Failed to download video:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 스트리밍 관련 API (개선된 버전)
   * ===================
   */

  async getLiveStream() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STREAM.LIVE);
      debugLog('Fetching live stream info:', url);
      
      const response = await httpClient.get(url, { 
        cache: true, 
        cacheTime: 30 * 1000,  // 30초 캐시
        timeoutMs: 5000        // 5초 타임아웃
      });
      
      debugLog('Live stream info received:', response);
      return response;
    } catch (error) {
      debugLog('Failed to fetch live stream info:', error.message);
      throw error;
    }
  }

  async getStreamStatus() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STREAM.STATUS);
      debugLog('Fetching stream status:', url);
      
      const response = await httpClient.get(url, {
        timeoutMs: 3000  // 3초 타임아웃 (상태 확인은 빨라야 함)
      });
      
      debugLog('Stream status received:', response);
      return response;
    } catch (error) {
      debugLog('Failed to fetch stream status:', error.message);
      throw error;
    }
  }

  async startStream() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STREAM.START);
      debugLog('Starting stream:', url);
      
      const response = await httpClient.post(url, {}, {
        timeoutMs: 10000  // 10초 타임아웃 (스트림 시작은 시간이 걸릴 수 있음)
      });
      
      debugLog('Stream started:', response);
      return response;
    } catch (error) {
      debugLog('Failed to start stream:', error.message);
      throw error;
    }
  }

  async stopStream() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.STREAM.STOP);
      debugLog('Stopping stream:', url);
      
      const response = await httpClient.post(url, {}, {
        timeoutMs: 5000  // 5초 타임아웃
      });
      
      debugLog('Stream stopped:', response);
      return response;
    } catch (error) {
      debugLog('Failed to stop stream:', error.message);
      throw error;
    }
  }

  /**
   * 스트림 URL 직접 테스트 (유틸리티 메소드)
   */
  async testStreamUrl(streamUrl, path = '') {
    try {
      const fullUrl = `${streamUrl}${path}`;
      debugLog('Testing stream URL:', fullUrl);
      
      // HEAD 요청으로 빠르게 테스트
      const response = await fetch(fullUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      });
      
      const isAccessible = response.ok;
      debugLog(`Stream URL test result for ${fullUrl}:`, isAccessible);
      
      return {
        url: fullUrl,
        accessible: isAccessible,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      debugLog('Stream URL test failed:', error.message);
      return {
        url: `${streamUrl}${path}`,
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * 여러 스트림 경로를 순차적으로 테스트
   */
  async findWorkingStreamUrl(baseUrl) {
    const commonPaths = [
      '/video_feed',    // Flask/OpenCV 일반적 경로
      '/stream',        // 일반적인 스트림 경로  
      '/mjpeg',         // MJPEG 스트림
      '/camera/stream', // 카메라 전용 스트림
      '/live',          // 라이브 스트림
      ''                // 기본 경로 (마지막에 시도)
    ];
    
    debugLog('Finding working stream URL from base:', baseUrl);
    
    for (const path of commonPaths) {
      const result = await this.testStreamUrl(baseUrl, path);
      if (result.accessible) {
        debugLog('Working stream URL found:', result.url);
        return result;
      }
    }
    
    debugLog('No working stream URL found for base:', baseUrl);
    return null;
  }

  /**
   * ===================
   * 알람/알림 관련 API (새로 추가)
   * ===================
   */

  async getLatestNotifications() {
    try {
      const url = buildApiUrl('/notifications/latest');
      debugLog('Fetching latest notifications:', url);
      
      const response = await httpClient.get(url, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        timeoutMs: 5000,  // 5초 타임아웃
        cache: false      // 실시간 데이터이므로 캐시 비활성화
      });
      
      debugLog('Latest notifications received:', response);
      return response;
    } catch (error) {
      debugLog('Failed to fetch latest notifications:', error.message);
      // 백엔드가 준비되지 않은 경우 빈 응답 반환
      return { count: 0, notifications: [] };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const url = buildApiUrl(`/notifications/${notificationId}/read`);
      debugLog('Marking notification as read:', { notificationId });
      
      const response = await httpClient.patch(url, {
        isRead: true
      });
      
      debugLog('Notification marked as read');
      return response;
    } catch (error) {
      debugLog('Failed to mark notification as read:', error.message);
      throw error;
    }
  }

  async getNotificationHistory(params = {}) {
    try {
      const queryParams = {
        page: params.page || PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: params.limit || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      };

      if (params.type) queryParams.type = params.type;
      if (params.isRead !== undefined) queryParams.isRead = params.isRead;
      if (params.severity) queryParams.severity = params.severity;

      const queryString = buildQueryString(queryParams);
      const url = buildApiUrl('/notifications') + queryString;

      debugLog('Fetching notification history:', queryParams);

      const response = await httpClient.get(url, {
        cache: true,
        cacheTime: CACHE_CONFIG.DEFAULT_CACHE_TIME
      });

      debugLog('Notification history fetched:', { count: response.data?.length || 0 });
      return response;

    } catch (error) {
      debugLog('Failed to fetch notification history:', error.message);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const url = buildApiUrl(`/notifications/${notificationId}`);
      debugLog('Deleting notification:', { notificationId });
      
      const response = await httpClient.delete(url);
      httpClient.clearCache('notifications');
      
      debugLog('Notification deleted');
      return response;
    } catch (error) {
      debugLog('Failed to delete notification:', error.message);
      throw error;
    }
  }

  async clearAllNotifications() {
    try {
      const url = buildApiUrl('/notifications/clear');
      debugLog('Clearing all notifications');
      
      const response = await httpClient.post(url);
      httpClient.clearCache('notifications');
      
      debugLog('All notifications cleared');
      return response;
    } catch (error) {
      debugLog('Failed to clear all notifications:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 대시보드 관련 API
   * ===================
   */

  async getDashboardStats() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.DASHBOARD.STATS);
      return await httpClient.get(url, { cache: true, cacheTime: CACHE_CONFIG.STATS_CACHE_TIME });
    } catch (error) {
      debugLog('Failed to fetch dashboard stats:', error.message);
      throw error;
    }
  }

  async getRecentVideos(limit = 6) {
    try {
      const queryString = buildQueryString({ limit });
      const url = buildApiUrl(API_ENDPOINTS.DASHBOARD.RECENT_VIDEOS) + queryString;
      return await httpClient.get(url, { cache: true, cacheTime: CACHE_CONFIG.VIDEO_LIST_CACHE_TIME });
    } catch (error) {
      debugLog('Failed to fetch recent videos:', error.message);
      throw error;
    }
  }

  async getChartData(params = {}) {
    try {
      const queryParams = { period: params.period || 'month' };
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const queryString = buildQueryString(queryParams);
      const url = buildApiUrl(API_ENDPOINTS.DASHBOARD.CHART_DATA) + queryString;

      return await httpClient.get(url, { cache: true, cacheTime: CACHE_CONFIG.STATS_CACHE_TIME });
    } catch (error) {
      debugLog('Failed to fetch chart data:', error.message);
      throw error;
    }
  }

  /**
   * ===================
   * 설정 관련 API
   * ===================
   */

  async getSettings() {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SETTINGS.GENERAL);
      return await httpClient.get(url, { cache: true, cacheTime: CACHE_CONFIG.DEFAULT_CACHE_TIME });
    } catch (error) {
      debugLog('Failed to fetch settings:', error.message);
      throw error;
    }
  }

  async updateSettings(settings) {
    try {
      const url = buildApiUrl(API_ENDPOINTS.SETTINGS.GENERAL);
      const response = await httpClient.put(url, settings);
      httpClient.clearCache('settings');
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

  async healthCheck() {
    try {
      const url = buildApiUrl("/health");
      return await httpClient.get(url);
    } catch (error) {
      debugLog('Health check failed:', error.message);
      throw error;
    }
  }

  clearAllCache() {
    httpClient.clearCache();
    debugLog('All cache cleared');
  }

  clearCacheByPattern(pattern) {
    httpClient.clearCache(pattern);
    debugLog('Cache cleared for pattern:', pattern);
  }

  /**
   * ===================
   * 개발/테스트 전용 메소드
   * ===================
   */

  // 개발 환경에서 알람 테스트용
  async triggerTestNotification(type = 'fall', severity = 'high') {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Test notification is only available in development mode');
      return null;
    }

    try {
      const url = buildApiUrl('/notifications/test');
      debugLog('Triggering test notification:', { type, severity });
      
      const response = await httpClient.post(url, {
        type,
        severity,
        timestamp: new Date().toISOString()
      });
      
      debugLog('Test notification triggered');
      return response;
    } catch (error) {
      debugLog('Failed to trigger test notification:', error.message);
      // 백엔드가 준비되지 않은 경우 모의 데이터 반환
      return {
        success: true,
        notification: {
          id: `test_${Date.now()}`,
          title: type === 'fall' ? '낙상 감지' : '알림',
          message: type === 'fall' ? '낙상이 감지되었습니다' : '테스트 알림입니다',
          severity: severity,
          type: type,
          createdAt: new Date().toISOString(),
          device_id: 'camera_01'
        }
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;