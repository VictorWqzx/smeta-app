import { HashRouter, Routes, Route } from 'react-router-dom'
import { EstimatesPage } from '@pages/estimates'
import { EstimateCreatePage } from '@pages/estimate-create'
import { EstimateEditPage } from '@pages/estimate-edit'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<EstimatesPage />} />
        <Route path="/create" element={<EstimateCreatePage />} />
        <Route path="/edit/:id" element={<EstimateEditPage />} />
      </Routes>
    </HashRouter>
  )
}
