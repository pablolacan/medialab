import { ProtectedRoute } from './components/ProtectedRoute'
import { UserMenu } from './components/UserMenu'
import { LoanForm } from './features/equipment-loan/components/LoanForm'

function App() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-zinc-100">
                  MVP Medialab
                </h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8 px-4">
          <LoanForm />
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default App