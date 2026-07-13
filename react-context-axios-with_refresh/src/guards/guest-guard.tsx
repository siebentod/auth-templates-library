import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

type GuestGuardProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function GuestGuard({ children, fallback = null }: GuestGuardProps) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    if (auth.loading) return

    if (auth.user) {
      navigate('/')
      return
    }

    setCanRender(true)
  }, [auth.loading, auth.user, navigate])

  if (auth.loading || !canRender) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
