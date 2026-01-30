import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
// Pages
import Dashboard from './pages/Dashboard';
import PipeInformation from './pages/PipeInformation';
import RealtimeMonitoring from './pages/Monitoring/RealtimeMonitoring';
import MeasurementFacility from './pages/Facilities/MeasurementFacility';
import ReductionFacilityList from './pages/Facilities/ReductionFacilityList';
import FacilityControl from './pages/Facilities/FacilityControl';
import AssetInventory from './pages/Asset/AssetInventory';
import MaintenanceWork from './pages/Maintenance/MaintenanceWork';
import OperationHistory from './pages/History/OperationHistory';
import ComplaintForm from './pages/Complaints/ComplaintForm';
import SystemManagement from './pages/Admin/SystemManagement';
import MobileMonitoring from './pages/Mobile/MobileMonitoring';
import LoginPage from './pages/Auth/LoginPage';
import TestMap from './pages/TestMap'; // NEW

const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-2">404 Not Found</h2>
        <p>요청하신 페이지를 찾을 수 없습니다.</p>
    </div>
);

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Main App Routes (All wrapped in Layout now, including Mobile) */}
                <Route path="*" element={
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/pipe-info" element={<PipeInformation />} />
                            <Route path="/monitoring" element={<RealtimeMonitoring />} />
                            <Route path="/monitoring/mobile" element={<MobileMonitoring />} />
                            <Route path="/test/map" element={<TestMap />} /> {/* NEW */}

                            <Route path="/facilities/measurement" element={<MeasurementFacility />} />
                            <Route path="/facilities/list" element={<ReductionFacilityList />} />
                            <Route path="/facilities/control" element={<FacilityControl />} />

                            <Route path="/asset" element={<AssetInventory />} />
                            <Route path="/maintenance" element={<MaintenanceWork />} />
                            <Route path="/history" element={<OperationHistory />} />
                            <Route path="/complaints" element={<ComplaintForm />} />

                            <Route path="/admin/system" element={<SystemManagement />} />

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
