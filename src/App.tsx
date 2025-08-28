// src/App.tsx
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoanForm } from './features/equipment-loan/components/LoanForm'

function App() {
  return (
    <ProtectedRoute>
      <Layout 
        title="Gestión de Préstamos"
        subtitle="Registra y administra los préstamos de equipos del laboratorio"
      >
        <div className="max-w-4xl mx-auto">
          <LoanForm />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}

export default App