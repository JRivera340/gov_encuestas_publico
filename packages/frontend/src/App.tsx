import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import DashboardPage from './pages/DashboardPage';
import SurveysPage from './pages/SurveysPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import SurveyBuilderPage from './pages/SurveyBuilderPage';
import SurveyPreviewPage from './pages/SurveyPreviewPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/surveys" element={<SurveysPage />} />
          <Route path="/surveys/new" element={<CreateSurveyPage />} />
          <Route path="/surveys/:id/builder" element={<SurveyBuilderPage />} />
          <Route path="/surveys/:id/preview" element={<SurveyPreviewPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

