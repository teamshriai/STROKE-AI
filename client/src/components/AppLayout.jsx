import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-paper lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
