import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/auth-provider'
import { AuthGuard } from '../guards/auth-guard'
import { GuestGuard } from '../guards/guest-guard'
import Home from './home'
import Login from './login'
import Registration from './registration'

const Pages = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard fallback={<p>Loading...</p>}>
                <Login />
              </GuestGuard>
            }
          />
          <Route
            path="/registration"
            element={
              <GuestGuard fallback={<p>Loading...</p>}>
                <Registration />
              </GuestGuard>
            }
          />
          <Route
            path="/"
            element={
              <AuthGuard fallback={<p>Loading...</p>}>
                <Home />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default Pages
