import { useAuth } from '../hooks/use-auth'

const Home = () => {
  const auth = useAuth()

  const handleLogout = () => {
    void auth.logout()
  }

  return (
    <div>
      <h1>Home</h1>
      {auth.user ? (
        <>
          <p>Username: {auth.user.username}</p>
          <p>Email: {auth.user.email}</p>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </>
      ) : null}
    </div>
  )
}

export default Home
