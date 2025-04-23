"use client"

import { useState, useEffect } from "react"
import { notificationService, type Notification, type NotificationType } from "@/lib/notification"
import { useToast } from "@/hooks/use-toast"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Add listener for new notifications
    const unsubscribe = notificationService.addListener((notification) => {
      setNotifications((prev) => [notification, ...prev])

      // Show toast for new notifications
      toast({
        title: notification.title,
        description: notification.message,
      })
    })

    return () => {
      unsubscribe()
    }
  }, [toast])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const sendNotification = (type: NotificationType, title: string, message: string) => {
    return notificationService.sendNotification({
      type,
      title,
      message,
    })
  }

  const scheduleNotification = (type: NotificationType, title: string, message: string, deliveryTime: Date) => {
    return notificationService.scheduleNotification(
      {
        type,
        title,
        message,
      },
      deliveryTime,
    )
  }

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    sendNotification,
    scheduleNotification,
  }
}

