import json
import os
from datetime import datetime
from typing import List, Dict, Optional
import uuid

NOTIFICATIONS_FILE = "notifications.json"

class NotificationService:
    def __init__(self):
        self.notifications_file = NOTIFICATIONS_FILE
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """notifications.json 파일이 없으면 생성"""
        if not os.path.exists(self.notifications_file):
            with open(self.notifications_file, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            print(f"✅ {self.notifications_file} 파일 생성 완료")
    
    def _load_notifications(self) -> Dict:
        """알림 데이터 로드"""
        try:
            with open(self.notifications_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ 알림 로드 실패: {str(e)}")
            return {}
    
    def _save_notifications(self, data: Dict):
        """알림 데이터 저장"""
        try:
            with open(self.notifications_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 알림 저장 실패: {str(e)}")
    
    def create_notification(
        self,
        to_user: str,
        from_user: str,
        from_type: str,
        notification_type: str,
        message: str,
        data: Optional[Dict] = None
    ) -> Dict:
        """새 알림 생성"""
        notifications = self._load_notifications()
        
        # 사용자의 알림 목록 가져오기
        if to_user not in notifications:
            notifications[to_user] = []
        
        # 새 알림 생성
        notification = {
            "id": str(uuid.uuid4()),
            "type": notification_type,
            "from_user": from_user,
            "from_type": from_type,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "read": False,
            "data": data or {}
        }
        
        # 알림 추가 (최신이 먼저)
        notifications[to_user].insert(0, notification)
        
        # 저장
        self._save_notifications(notifications)
        
        print(f"📬 새 알림 생성: {from_user} -> {to_user}")
        return notification
    
    def get_user_notifications(
        self, 
        username: str, 
        limit: int = 20,
        unread_only: bool = False
    ) -> List[Dict]:
        """사용자의 알림 목록 조회"""
        notifications = self._load_notifications()
        user_notifications = notifications.get(username, [])
        
        if unread_only:
            user_notifications = [n for n in user_notifications if not n.get("read", False)]
        
        return user_notifications[:limit]
    
    def mark_as_read(self, username: str, notification_id: str) -> bool:
        """알림을 읽음으로 표시"""
        notifications = self._load_notifications()
        
        if username not in notifications:
            return False
        
        for notification in notifications[username]:
            if notification.get("id") == notification_id:
                notification["read"] = True
                self._save_notifications(notifications)
                print(f"✅ 알림 읽음 처리: {notification_id}")
                return True
        
        return False
    
    def mark_all_as_read(self, username: str) -> int:
        """사용자의 모든 알림을 읽음으로 표시"""
        notifications = self._load_notifications()
        
        if username not in notifications:
            return 0
        
        count = 0
        for notification in notifications[username]:
            if not notification.get("read", False):
                notification["read"] = True
                count += 1
        
        self._save_notifications(notifications)
        print(f"✅ 모든 알림 읽음 처리: {username} ({count}개)")
        return count
    
    def delete_notification(self, username: str, notification_id: str) -> bool:
        """알림 삭제"""
        notifications = self._load_notifications()
        
        if username not in notifications:
            return False
        
        original_length = len(notifications[username])
        notifications[username] = [
            n for n in notifications[username] 
            if n.get("id") != notification_id
        ]
        
        if len(notifications[username]) < original_length:
            self._save_notifications(notifications)
            print(f"🗑️ 알림 삭제: {notification_id}")
            return True
        
        return False
    
    def get_unread_count(self, username: str) -> int:
        """읽지 않은 알림 개수 조회"""
        notifications = self._load_notifications()
        user_notifications = notifications.get(username, [])
        return sum(1 for n in user_notifications if not n.get("read", False))

