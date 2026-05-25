import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route path="/" element={<div className="flex items-center justify-center h-screen text-2xl font-bold">MyDartTraining</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
