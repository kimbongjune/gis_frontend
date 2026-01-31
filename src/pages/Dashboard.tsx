import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle } from 'lucide-react';
import { GiCaveman } from "react-icons/gi";
import { MdOutlineSensors } from "react-icons/md";
import DashboardMap from '../components/Dashboard/DashboardMap';
import SensorTable from '../components/Dashboard/SensorTable';
import AlarmPopup from '../components/Common/AlarmPopup';
import { SensorData } from '../types';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Mock Data Generators
const generateMockSensors = (): SensorData[] => {
    return [
        { sensor_id: 'S001', name: '백운광장 1', latitude: 35.129, longitude: 126.912, values: { h2s: 0.05, nh3: 1.2, voc: 0.5 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString() },
        { sensor_id: 'S002', name: '봉선시장 입구', latitude: 35.125, longitude: 126.915, values: { h2s: 0.8, nh3: 5.5, voc: 2.1 }, grade: 3, status: 'ALARM', timestamp: new Date().toISOString() },
        { sensor_id: 'S003', name: '효덕초등학교', latitude: 35.122, longitude: 126.908, values: { h2s: 0.02, nh3: 0.8, voc: 0.1 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString() },
        { sensor_id: 'S004', name: '진월동 주민센터', latitude: 35.118, longitude: 126.905, values: { h2s: 0.00, nh3: 0.0, voc: 0.0 }, grade: 1, status: 'DISCONNECT', timestamp: new Date().toISOString() },
        { sensor_id: 'S005', name: '양림동 역사문화마을', latitude: 35.135, longitude: 126.915, values: { h2s: 1.2, nh3: 3.5, voc: 1.5 }, grade: 2, status: 'NORMAL', timestamp: new Date().toISOString() },
    ];
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sensors, setSensors] = useState<SensorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [alarmPopupData, setAlarmPopupData] = useState<{ location: string; type: string; value: string; time: string; level: 'WARNING' | 'CRITICAL' | 'DISCONNECT' } | null>(null);

    // Stats
    const stats = {
        totalSensors: 5,
        todayAlarms: 3,
        todayComplaints: 5,
        alarmTrend: 'up', // 'up' | 'down'
        complaintTrend: 'down'
    };

    useEffect(() => {
        // Simulate Fetch
        setTimeout(() => {
            setSensors(generateMockSensors());
            setLoading(false);
        }, 500);

        // Simulate Alarm Popup Trigger (Test)
        setTimeout(() => {
            setAlarmPopupData({
                location: '봉선시장 입구',
                type: '복합악취 임계치 초과',
                value: '15.2 OU',
                time: new Date().toLocaleTimeString(),
                level: 'CRITICAL'
            });
        }, 3000); // Trigger after 3 seconds

        // Real-time update simulation
        const interval = setInterval(() => {
            setSensors(prev => prev.map(s => {
                if (s.status === 'DISCONNECT') return s;
                // Random fluctuation
                const newH2s = Math.max(0, s.values.h2s + (Math.random() - 0.5) * 0.1);
                return {
                    ...s,
                    values: { ...s.values, h2s: parseFloat(newH2s.toFixed(2)) },
                    timestamp: new Date().toISOString()
                };
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Chart Config
    const chartData = {
        labels: ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50'],
        datasets: [
            {
                label: '평균 복합악취 (OU)',
                data: [3, 4, 3.5, 5, 8, 6],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3,
            },
            {
                label: '안정 기준선',
                data: [10, 10, 10, 10, 10, 10],
                borderColor: 'rgb(53, 162, 235)',
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        maintainAspectRatio: false,
    };

    // Recent Alarms
    const alarms = [
        { id: 1, time: '10:45:22', location: '봉선시장 입구', type: '복합악취 초과 (15 OU)', level: '심각' },
        { id: 2, time: '09:12:05', location: '백운광장 1', type: 'H₂S 농도 주의', level: '주의' },
        { id: 3, time: '08:30:00', location: '진월동 주민센터', type: '통신 미수신 (30분)', level: '장애' },
    ];

    const handleSensorClick = (sensor: SensorData) => {
        // Navigate to monitoring page, potentially with filtering if implemented later
        // For now, just go to the monitoring page as requested for "detailed view" context
        navigate('/monitoring');
    };

    return (
        <div className="flex flex-col h-full gap-6 p-2">
            <AlarmPopup
                isOpen={!!alarmPopupData}
                onClose={() => setAlarmPopupData(null)}
                onDetail={() => navigate('/monitoring')}
                data={alarmPopupData}
            />
            {/* 1. Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">총 설치 센서</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.totalSensors} <span className="text-base font-normal text-gray-400">개소</span></h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <MdOutlineSensors size={24} className="transform rotate-180" /> {/* Just an icon */}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">금일 경보 발생</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-red-600">{stats.todayAlarms} <span className="text-base font-normal text-gray-400">건</span></h3>
                            <span className="flex items-center text-xs text-red-500 mb-1.5 bg-red-50 px-1.5 py-0.5 rounded">
                                <ArrowUp size={12} /> 2건 증가
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">금일 민원 접수</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-gray-800">{stats.todayComplaints} <span className="text-base font-normal text-gray-400">건</span></h3>
                            <span className="flex items-center text-xs text-green-500 mb-1.5 bg-green-50 px-1.5 py-0.5 rounded">
                                <ArrowDown size={12} /> 1건 감소
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        {/* <CheckCircle size={24} /> */}
                        <GiCaveman size={24} />
                    </div>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Center: GIS Map (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            실시간 악취 지도
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Live</span>
                        </h2>
                        <div className="text-xs text-gray-400">최종 업데이트: {new Date().toLocaleTimeString()}</div>
                    </div>
                    <div className="flex-1 relative">
                        <DashboardMap sensors={sensors} />
                    </div>
                </div>

                {/* Right: Charts & List */}
                <div className="flex flex-col gap-6 min-h-0">
                    {/* Chart */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col min-h-0">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm">최근 1시간 악취 데이터 Trend</h3>
                        <div className="flex-1 min-h-[150px]">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>

                    {/* Alarm List */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-gray-800 text-sm">실시간 경보 이력</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {alarms.map((alarm) => (
                                <div key={alarm.id} className="flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${alarm.level === '심각' ? 'bg-red-500' : alarm.level === '주의' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{alarm.location}</span>
                                            <span className="text-xs text-gray-400">{alarm.time}</span>
                                        </div>
                                        <p className="text-xs text-red-600 font-medium">{alarm.type}</p>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="text-center py-2 text-xs text-gray-400 cursor-pointer hover:text-blue-500"
                                onClick={() => navigate('/history')}
                            >
                                더 보기
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Bottom: Sensor Table */}
            <div className="h-[250px] shrink-0">
                <SensorTable sensors={sensors} onSensorClick={handleSensorClick} />
            </div>
        </div>
    );
};

export default Dashboard;
