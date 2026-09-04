import { Route, Routes } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage.jsx';
import AppLayout from './components/AppLayout.jsx';
import PatientReportPage from './pages/PatientReportPage.jsx';
import BrainHaemorrhagePathwayPage from './pages/BrainHaemorrhagePathwayPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<PatientReportPage />} />
        <Route path="brain-haemorrhage-pathway" element={<BrainHaemorrhagePathwayPage />} />
      </Route>
    </Routes>
  );
}

export default App;
