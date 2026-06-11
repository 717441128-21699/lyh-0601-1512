import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CoursesPage from './pages/Courses/CoursesPage';
import QuestionsPage from './pages/Questions/QuestionsPage';
import HomeworkPage from './pages/Homework/HomeworkPage';
import FlashcardsPage from './pages/Flashcards/FlashcardsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}
