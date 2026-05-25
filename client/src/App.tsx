import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './front/pages/LoginPage'
import RegisterPage from './front/pages/RegisterPage'
import HomePage from './front/pages/HomePage'
import ProtectedRoute from './front/components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige / vers /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Route protégée : redirige vers /login si non authentifié */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
