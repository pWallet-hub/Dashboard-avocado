import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard'
import Admin from './Pages/Admin/Admin'
import Agent from './Pages/Agent/Agent'
import Farmer from './Pages/Farmer/Farmer'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        
        <Route path="/agent" element={<Agent />} />
        <Route path="/farmer" element={<Farmer />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App