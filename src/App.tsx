// src/App.tsx
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { CalendarLoanManagement } from './features/equipment-loan/components/CalendarLoanManagement'

function App() {
  return (
    <ProtectedRoute>
      <Layout 
        title="Gestión de Préstamos"
        subtitle="Selecciona eventos del calendario y registra préstamos"
      >
        <CalendarLoanManagement />
      </Layout>
    </ProtectedRoute>
  )
}

export default App