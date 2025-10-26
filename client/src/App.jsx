import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import Dashboard from './pages/Dashboard'
import Summary from './pages/Summary'
import Simulator from './pages/Simulator'
import HealthCheck from './pages/HealthCheck'
import Alerts from './pages/Alerts'
import { ChatProvider } from './contexts/ChatContext'

function App() {
  return (
    <ChatProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/health" element={<HealthCheck />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </Layout>
    </ChatProvider>
  )
}

export default App
