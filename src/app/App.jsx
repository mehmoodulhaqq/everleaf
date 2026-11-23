import AppRoutes from '../routes/AppRoutes'
import { AuthProvider } from '../context/AuthContext'
import useTheme from '../hooks/useTheme'

function App() {
  // Preserve the existing Redux-backed theme behavior.
  useTheme()

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App