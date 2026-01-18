import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Board from './pages/Board'
import Files from './pages/Files'
import Documents from './pages/DocumentsNew'
import Goals from './pages/Goals'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import Chat from './pages/ChatNew'
import Analytics from './pages/Analytics'
import ProjectDetails from './pages/ProjectDetails'
import Gantt from './pages/Gantt'
import ChatNew from './pages/ChatNew'
import DocumentsNew from './pages/DocumentsNew'
import WhiteboardNew from './pages/WhiteboardNew'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/projects" element={<Projects />} />
        <Route path="/app/projects/:id" element={<ProjectDetails />} />
        <Route path="/app/board" element={<Board />} />
        <Route path="/app/gantt" element={<Gantt />} />
        <Route path="/app/chat" element={<ChatNew />} />
        <Route path="/app/whiteboard" element={<WhiteboardNew />} />
        <Route path="/app/documents" element={<DocumentsNew />} />
        <Route path="/app/files" element={<Files />} />
        <Route path="/app/goals" element={<Goals />} />
        <Route path="/app/analytics" element={<Analytics />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/settings" element={<Settings />} />
        <Route path="/app/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
