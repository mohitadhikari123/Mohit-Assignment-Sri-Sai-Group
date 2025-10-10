import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../redux/slices/notificationsSlice';
import '../styles/NotificationBell.css'; // Custom CSS for styling

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useSelector(state => state.notifications.notifications);
  const unreadCount = useSelector(selectUnreadNotificationsCount);
  const dispatch = useDispatch();
  const bellRef = useRef(null);
  const containerRef = useRef(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (id) => {
    dispatch(markNotificationAsRead(id));
    // setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellRef.current && !bellRef.current.contains(event.target) &&
        containerRef.current && !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-bell-wrapper">
      <div className="notification-bell" onClick={toggleOpen} ref={bellRef}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="bell-icon">
          <path d="M12 2C9.79 2 8 3.79 8 6v7.59c0 .52-.21 1.03-.59 1.41L6 16v1h12v-1l-1.41-1.41c-.38-.38-.59-.89-.59-1.41V6c0-2.21-1.79-4-4-4zm-2 18c0 1.1.9 2 2 2s2-.9 2-2H10z"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-container" ref={containerRef}>
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-all-read-btn">Mark all as read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">No new notifications.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-content">
                    <span className="notification-message">{notification.message}</span>
                    <span className="notification-timestamp">{new Date(notification.timestamp).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;