import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SensorData, ODOR_GRADES } from '../../types';
import { Download, RefreshCw, AlertTriangle, Search, Calendar, Filter, MapPin } from 'lucide-react';
import DashboardMap from '../../components/Dashboard/DashboardMap';
import AlarmPopup from '../../components/Common/AlarmPopup';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MOCK_SENSORS: SensorData[] = [
    { sensor_id: 'S001', name: '백운광장 1', values: { h2s: 0.05, nh3: 1.2, voc: 0.5 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 35.129, longitude: 126.912 },
    { sensor_id: 'S002', name: '봉선시장 입구', values: { h2s: 0.8, nh3: 5.5, voc: 2.1 }, grade: 3, status: 'ALARM', timestamp: new Date().toISOString(), latitude: 35.125, longitude: 126.915 },
    { sensor_id: 'S003', name: '효덕초등학교', values: { h2s: 0.02, nh3: 0.8, voc: 0.1 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 35.118, longitude: 126.908 },
    { sensor_id: 'S004', name: '진월동 주민센터', values: { h2s: 0.00, nh3: 0.0, voc: 0.0 }, grade: 1, status: 'DISCONNECT', timestamp: new Date().toISOString(), latitude: 35.122, longitude: 126.910 },
    { sensor_id: 'S005', name: '양림동 역사문화마을', values: { h2s: 1.2, nh3: 3.5, voc: 1.5 }, grade: 2, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 35.132, longitude: 126.918 },
    { sensor_id: 'S006', name: '백운광장 2', values: { h2s: 0.1, nh3: 1.5, voc: 0.6 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 35.128, longitude: 126.913 },
    { sensor_id: 'S007', name: '주월동 공영주차장', values: { h2s: 2.5, nh3: 8.0, voc: 3.2 }, grade: 4, status: 'ALARM', timestamp: new Date().toISOString(), latitude: 35.130, longitude: 126.914 },
];

const THRESHOLDS = {
    OU: 5.0,
    H2S: 0.06, // ppm
    NH3: 5.0, // ppm
    VOC: 1.0  // ppm
};

const RealtimeMonitoring: React.FC = () => {
    const [sensors, setSensors] = useState<SensorData[]>(MOCK_SENSORS);
    const [selectedSensorId, setSelectedSensorId] = useState<string>('S001');
    const [filterItem, setFilterItem] = useState('ALL');
    const [filterRegion, setFilterRegion] = useState('ALL');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [alarmPopupData, setAlarmPopupData] = useState<{ location: string; type: string; value: string; time: string; level: 'WARNING' | 'CRITICAL' | 'DISCONNECT' } | null>(null);

    // Filter Logic
    const filteredSensors = sensors.filter(s => {
        if (filterRegion === 'ALL') return true;
        return s.name.includes(filterRegion);
    });

    // Alarm Simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            setAlarmPopupData({
                location: '봉선시장 입구',
                type: '황화수소(H₂S) 임계치 초과',
                value: '0.8 ppm',
                time: new Date().toLocaleTimeString(),
                level: 'CRITICAL'
            });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Helper to get labels based on date range
    const getChartLabels = () => {
        if (startDate === endDate) {
            return Array.from({ length: 24 }, (_, i) => `${i}:00`);
        } else {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Array.from({ length: diffDays + 1 }, (_, i) => {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            });
        }
    };

    const getChartDatasets = () => {
        const labels = getChartLabels();
        const dataLength = labels.length;

        // Base Complex Odor (Blue)
        const datasets: any[] = [{
            label: '복합악취 (OU)',
            data: Array.from({ length: dataLength }, () => Math.random() * 5 + (selectedSensorId === 'S002' ? 5 : 0)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }];

        // Threshold Line for Complex Odor
        datasets.push({
            label: 'OU 기준치',
            data: Array(dataLength).fill(THRESHOLDS.OU),
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false
        });

        // Specific Item (Green)
        let secondLabel = 'H₂S (ppm)';
        let secondColor = 'rgb(16, 185, 129)';
        let thresholdValue = THRESHOLDS.H2S;

        switch (filterItem) {
            case 'NH3':
                secondLabel = 'NH₃ (ppm)';
                thresholdValue = THRESHOLDS.NH3;
                break;
            case 'VOC':
                secondLabel = 'VOCs (ppm)';
                thresholdValue = THRESHOLDS.VOC;
                break;
            default:
                secondLabel = 'H₂S (ppm)';
                thresholdValue = THRESHOLDS.H2S;
        }

        datasets.push({
            label: secondLabel,
            data: Array.from({ length: dataLength }, () => Math.random() * (thresholdValue * 1.5)), // Mock data around threshold
            borderColor: secondColor,
            backgroundColor: secondColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            tension: 0.4,
            fill: true
        });

        // Threshold Line for Specific Item
        datasets.push({
            label: `${secondLabel.split(' ')[0]} 기준치`,
            data: Array(dataLength).fill(thresholdValue),
            borderColor: secondColor.replace('rgb', 'rgba').replace(')', ', 0.5)'),
            borderDash: [5, 5],
            pointRadius: 0,
            borderWidth: 1,
            fill: false
        });

        return datasets;
    };

    const chartData = {
        labels: getChartLabels(),
        datasets: getChartDatasets()
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <AlarmPopup
                isOpen={!!alarmPopupData}
                onClose={() => setAlarmPopupData(null)}
                data={alarmPopupData}
            />

            {/* 1. Top Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-500" />
                        <span className="font-bold text-gray-700">관리 지역</span>
                        <select
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 focus:border-blue-500 outline-none"
                            value={filterRegion}
                            onChange={(e) => setFilterRegion(e.target.value)}
                        >
                            <option value="ALL">전체 지역</option>
                            <option value="백운">백운광장</option>
                            <option value="봉선">봉선시장</option>
                            <option value="진월">진월동</option>
                            <option value="양림">양림동</option>
                            <option value="주월">주월동</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <span className="font-bold text-gray-700">측정 항목</span>
                        <select
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-gray-50 focus:border-blue-500 outline-none"
                            value={filterItem}
                            onChange={(e) => setFilterItem(e.target.value)}
                        >
                            <option value="ALL">전체 항목</option>
                            <option value="H2S">황화수소 (H₂S)</option>
                            <option value="NH3">암모니아 (NH₃)</option>
                            <option value="VOC">VOCs</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="font-bold text-gray-700">조회 기간</span>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded px-2 py-1">
                            <input
                                type="date"
                                className="bg-transparent text-sm outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-gray-400">~</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
                        <Search size={16} /> 조회
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">마지막 업데이트: {new Date().toLocaleTimeString()}</span>
                    <button className="p-2 border rounded hover:bg-gray-50 transition-colors" title="새로고침">
                        <RefreshCw size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex flex-1 gap-4 min-h-0">
                {/* Left: Map Area (40%) */}
                <div className="w-[40%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-blue-500" /> 센서 위치 및 상태
                        </h3>
                    </div>
                    <div className="flex-1 relative">
                        {/* Use filteredSensors for the map */}
                        <DashboardMap sensors={filteredSensors} />
                    </div>
                </div>

                {/* Right: Graph & Table (60%) */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Top: Real-time Graph */}
                    <div className="h-[40%] bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            📈 실시간 농도 추이 ({sensors.find(s => s.sensor_id === selectedSensorId)?.name})
                        </h3>
                        <div className="flex-1 min-h-0">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>

                    {/* Bottom: Sensor Data Table */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
                        <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold text-gray-800">📋 센서별 상세 데이터</h3>
                            <button className="text-xs flex items-center gap-1 bg-white border px-2 py-1 rounded hover:bg-gray-50">
                                <Download size={12} /> 엑셀 저장
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-center">
                                <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 border-b">ID</th>
                                        <th className="p-2 border-b">센서명</th>
                                        <th className="p-2 border-b">수집시간</th>
                                        <th className="p-2 border-b">상태</th>
                                        <th className="p-2 border-b">복합악취</th>
                                        <th className="p-2 border-b">H₂S</th>
                                        <th className="p-2 border-b">NH₃</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSensors.map(sensor => {
                                        const isSelected = sensor.sensor_id === selectedSensorId;
                                        return (
                                            <tr
                                                key={sensor.sensor_id}
                                                onClick={() => setSelectedSensorId(sensor.sensor_id)}
                                                className={`cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                            >
                                                <td className="p-2 font-mono text-gray-500">{sensor.sensor_id}</td>
                                                <td className="p-2 text-left font-medium">{sensor.name}</td>
                                                <td className="p-2 text-gray-500">{new Date(sensor.timestamp).toLocaleTimeString()}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${sensor.status === 'NORMAL' ? 'bg-green-100 text-green-700' : sensor.status === 'ALARM' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                                                        {sensor.status}
                                                    </span>
                                                </td>
                                                <td className="p-2 font-mono">{sensor.values.voc}</td>
                                                <td className="p-2 font-mono">{sensor.values.h2s}</td>
                                                <td className="p-2 font-mono">{sensor.values.nh3}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealtimeMonitoring;
