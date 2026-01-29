import React, { useState, useEffect } from 'react';
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
import { SensorData, ODOR_GRADES } from '../../types';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MOCK_SENSORS: SensorData[] = [
    { sensor_id: 'S001', name: '백운광장 1', values: { h2s: 0.05, nh3: 1.2, voc: 0.5 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S002', name: '봉선시장 입구', values: { h2s: 0.8, nh3: 5.5, voc: 2.1 }, grade: 3, status: 'ALARM', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S003', name: '효덕초등학교', values: { h2s: 0.02, nh3: 0.8, voc: 0.1 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S004', name: '진월동 주민센터', values: { h2s: 0.00, nh3: 0.0, voc: 0.0 }, grade: 1, status: 'DISCONNECT', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S005', name: '양림동 역사문화마을', values: { h2s: 1.2, nh3: 3.5, voc: 1.5 }, grade: 2, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S006', name: '백운광장 2', values: { h2s: 0.1, nh3: 1.5, voc: 0.6 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
    { sensor_id: 'S007', name: '주월동 공영주차장', values: { h2s: 2.5, nh3: 8.0, voc: 3.2 }, grade: 4, status: 'ALARM', timestamp: new Date().toISOString(), latitude: 0, longitude: 0 },
];

const RealtimeMonitoring: React.FC = () => {
    const [sensors, setSensors] = useState<SensorData[]>(MOCK_SENSORS);
    const [selectedSensorId, setSelectedSensorId] = useState<string>('S001');

    // Generate chart data based on selected sensor
    const chartData = {
        labels: Array.from({ length: 12 }, (_, i) => `${10 + Math.floor(i / 2)}:${(i % 2) * 30}`), // 10:00, 10:30...
        datasets: [
            {
                label: '복합악취 (OU)',
                data: Array.from({ length: 12 }, () => Math.random() * 5 + (selectedSensorId === 'S002' ? 5 : 0)),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4
            },
            {
                label: 'H₂S (ppm)',
                data: Array.from({ length: 12 }, () => Math.random() * 0.5),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.4
            }
        ]
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Top: Trend Chart */}
            <div className="h-[40%] bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-orange-500" />
                        실시간 트렌드 분석 ({sensors.find(s => s.sensor_id === selectedSensorId)?.name})
                    </h3>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-xs border rounded px-2 py-1 hover:bg-gray-50"><RefreshCw size={12} /> 새로고침</button>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <Line options={{ maintainAspectRatio: false, responsive: true }} data={chartData} />
                </div>
            </div>

            {/* Bottom: Data Grid */}
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">센서별 실시간 측정 현황</h3>
                    <button className="flex items-center gap-1 text-sm bg-white border border-gray-300 rounded px-3 py-1.5 shadow-sm hover:bg-gray-50">
                        <Download size={14} /> 엑셀 다운로드
                    </button>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-center">
                        <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b">센서명</th>
                                <th className="p-3 border-b">수집시간</th>
                                <th className="p-3 border-b">상태</th>
                                <th className="p-3 border-b">악취 등급</th>
                                <th className="p-3 border-b">복합악취 (OU)</th>
                                <th className="p-3 border-b">H₂S (ppm)</th>
                                <th className="p-3 border-b">NH₃ (ppm)</th>
                                <th className="p-3 border-b">VOC (ppm)</th>
                                <th className="p-3 border-b">배터리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map(sensor => {
                                const isAlarm = sensor.status === 'ALARM';
                                const isSelected = sensor.sensor_id === selectedSensorId;
                                return (
                                    <tr
                                        key={sensor.sensor_id}
                                        onClick={() => setSelectedSensorId(sensor.sensor_id)}
                                        className={`cursor-pointer hover:bg-blue-50 transition-colors border-b last:border-0 ${isSelected ? 'bg-blue-50' : ''} ${isAlarm ? 'bg-red-50 hover:bg-red-100' : ''}`}
                                    >
                                        <td className="p-3 font-medium text-left pl-6">{sensor.name}</td>
                                        <td className="p-3 text-gray-500">{new Date(sensor.timestamp).toLocaleTimeString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${sensor.status === 'NORMAL' ? 'bg-green-100 text-green-700' : sensor.status === 'ALARM' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {sensor.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ODOR_GRADES[sensor.grade]?.color }}></div>
                                                {ODOR_GRADES[sensor.grade]?.label}
                                            </div>
                                        </td>
                                        <td className={`p-3 font-mono ${isAlarm ? 'text-red-600 font-bold' : ''}`}>{(sensor.values.voc * 10).toFixed(1)}</td>
                                        <td className="p-3 font-mono">{sensor.values.h2s}</td>
                                        <td className="p-3 font-mono">{sensor.values.nh3}</td>
                                        <td className="p-3 font-mono">{sensor.values.voc}</td>
                                        <td className="p-3 text-gray-500">
                                            <div className="w-10 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: '90%' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RealtimeMonitoring;
