import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 알림 데이터 로드 (useCallback으로 메모이제이션)
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/notifications?username=${encodeURIComponent(user.id)}&limit=20`);
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
        setUnreadCount(result.unread_count || 0);
        console.log('✅ 알림 로드 완료:', result.unread_count, '개의 읽지 않은 알림');
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
  }, [user?.id]);

  // 사용자 로그인/로그아웃 시 WebSocket 연결/해제
  useEffect(() => {

    // WebSocket 연결
    const connectWebSocket = () => {
      if (!user?.id || wsRef.current) return;

      try {
        const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
        
        ws.onopen = () => {
          console.log('🔌 WebSocket 연결됨:', user.id);
          wsRef.current = ws;
        };
        
        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            console.log('📬 새 알림 수신:', notification);
            
            // 알림 목록 업데이트 (최신이 먼저)
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          } catch (error) {
            console.error('알림 파싱 실패:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket 오류:', error);
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket 연결 종료');
          wsRef.current = null;
          
          // 5초 후 재연결 시도
          if (user?.id) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 WebSocket 재연결 시도...');
              connectWebSocket();
            }, 5000);
          }
        };
        
      } catch (error) {
        console.error('WebSocket 연결 실패:', error);
      }
    };

    if (user?.id) {
      loadNotifications();
      connectWebSocket();
    } else {
      // 로그아웃 시 연결 해제
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id, loadNotifications]);

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    if (!user?.id) return false;
    
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}/read?username=${encodeURIComponent(user.id)}`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('✅ 알림 읽음 처리:', notificationId);
        return true;
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
    return false;
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!user?.id) return false;
    
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/read-all?username=${encodeURIComponent(user.id)}`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        console.log('✅ 모든 알림 읽음 처리');
        return true;
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
    return false;
  };

  // 알림 삭제
  const deleteNotification = async (notificationId) => {
    if (!user?.id) return false;
    
    try {
      const response = await fetch(
        `http://localhost:8000/notifications/${notificationId}?username=${encodeURIComponent(user.id)}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        console.log('🗑️ 알림 삭제:', notificationId);
        return true;
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
    return false;
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

