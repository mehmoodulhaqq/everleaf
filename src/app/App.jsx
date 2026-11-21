import AppLayout from '../components/layout/AppLayout'
import useTheme from '../hooks/useTheme'

function App() {
  // Apply the saved Redux theme when the application mounts and keep it in sync.
  useTheme()

  return <AppLayout />
}

export default App
