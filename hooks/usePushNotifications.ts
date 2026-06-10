import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    } else {
      setIsLoading(false)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        setSubscription(sub)
      }
    } catch (err) {
      console.error('Service Worker registration failed: ', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToPush = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      setSubscription(sub)

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub })
      })

      if (!res.ok) {
        throw new Error('Failed to save subscription on server')
      }
    } catch (err) {
      console.error('Failed to subscribe: ', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setIsLoading(true)
    try {
      if (subscription) {
        const res = await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
        if (res.ok) {
          await subscription.unsubscribe()
          setSubscription(null)
        } else {
          throw new Error('Failed to remove subscription on server')
        }
      }
    } catch (err) {
      console.error('Failed to unsubscribe: ', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    subscription,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
    error
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
