import { Route, Routes } from 'react-router-dom';
import LandingPage from './landingpage.jsx';
import AppLayout from './components/AppLayout.jsx';
import PatientReportPage from './pages/PatientReportPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<PatientReportPage />} />
      </Route>
    </Routes>
  );
}

export default App;
