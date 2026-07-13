import { useEffect, useState, type ReactNode } from 'react'
import {
  createSearchParams,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

type AuthGuardProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (auth.loading) return

    if (auth.user === null) {
      setIsAuthorized(false)
      navigate({
        pathname: '/login',
        search: createSearchParams({
          returnUrl: location.pathname,
        }).toString(),
      })
      return
    }

    setIsAuthorized(true)
  }, [auth.loading, auth.user, location.pathname, navigate])

  if (auth.loading || !isAuthorized) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
