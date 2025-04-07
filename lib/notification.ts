// This is a mock notification service that would be replaced with a real implementation
// in a production environment (e.g., using web push notifications, SMS, etc.)

export type NotificationType = "reservation" | "payment" | "reminder" | "expiry" | "penalty"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = []

  // Add a notification listener
  public addListener(listener: (notification: Notification) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Send a notification
  public sendNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    const fullNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date(),
      read: false,
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(fullNotification))

    // In a real app, this would also send the notification to a backend service
    // for delivery via push notifications, SMS, email, etc.
    console.log("Notification sent:", fullNotification)

    return fullNotification
  }

  // Schedule a notification for future delivery
  public scheduleNotification(notification: Omit<Notification, "id" | "timestamp" | "read">, deliveryTime: Date) {
    const timeUntilDelivery = deliveryTime.getTime() - Date.now()

    if (timeUntilDelivery <= 0) {
      // Send immediately if the delivery time is in the past
      return this.sendNotification(notification)
    }

    // Schedule for future delivery
    const timerId = setTimeout(() => {
      this.sendNotification(notification)
    }, timeUntilDelivery)

    // Return a function to cancel the scheduled notification
    return () => clearTimeout(timerId)
  }
}

// Export a singleton instance
export const notificationService = new NotificationService()

