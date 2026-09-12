import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Create from './pages/Create';
import Dashboard from './pages/Dashboard';
import Invite from './pages/Invite';
import Surprise from './pages/Surprise';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<Create />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/surprise/:slug" element={<Surprise />} />
        <Route
          path="*"
          element={
            <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-2 bg-paper px-6 text-center">
              <span className="text-4xl">🙈</span>
              <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
              <a href="/" className="font-sans text-sm font-bold text-ink-soft underline">
                Back home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
