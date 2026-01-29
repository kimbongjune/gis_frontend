import React, { useState } from 'react';
import { MapPin, List, Battery, Signal, Smartphone } from 'lucide-react';
import DashboardMap from '../../components/Dashboard/DashboardMap';
import { SensorData } from '../../types';

const MobileMonitoring: React.FC = () => {
    // Mock Data simulating Field Personnel or Mobile Sensors
    const [units] = useState<SensorData[]>([
        { sensor_id: 'M-001', name: '현장팀 A (김반장)', grade: 1, status: 'NORMAL', latitude: 35.130, longitude: 126.913, values: { h2s: 0.0, nh3: 0.2, voc: 0.1 }, timestamp: '2023-10-25 14:05' },
        { sensor_id: 'M-002', name: '현장팀 B (이주임)', grade: 2, status: 'ALARM', latitude: 35.126, longitude: 126.916, values: { h2s: 0.5, nh3: 2.1, voc: 1.2 }, timestamp: '2023-10-25 14:02' },
        { sensor_id: 'M-003', name: '이동형 측정차량 1호', grade: 1, status: 'NORMAL', latitude: 35.128, longitude: 126.910, values: { h2s: 0.0, nh3: 0.5, voc: 0.3 }, timestamp: '2023-10-25 14:10' },
    ]);

    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4">
            {/* Map Area */}
            <div className="flex-1 lg:w-2/3 bg-white rounded-lg shadow border border-gray-200 overflow-hidden relative min-h-[400px]">
                <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-2 rounded shadow text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    실시간 현장 요원 및 이동형 센서 위치
                </div>
                {/* Reusing DashboardMap but could be customized for Mobile Units */}
                <DashboardMap sensors={units} />
            </div>

            {/* List/Sidebar Area */}
            <div className="lg:w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col h-[500px] lg:h-auto">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Smartphone size={18} /> 현장 모니터링 목록
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{units.length}대 가동중</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {units.map(unit => (
                        <div
                            key={unit.sensor_id}
                            onClick={() => setSelectedUnitId(unit.sensor_id)}
                            className={`p-4 rounded border cursor-pointer transition-all hover:shadow-md ${selectedUnitId === unit.sensor_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-gray-800">{unit.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{unit.timestamp} 수신</div>
                                </div>
                                {unit.status === 'ALARM' ? (
                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded animate-pulse">경보 발생</span>
                                ) : (
                                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded">정상 운용</span>
                                )}
                            </div>

                            {/* Sensor Values */}
                            <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-50 p-2 rounded text-center">
                                <div>
                                    <div className="text-[10px] text-gray-400">복합악취</div>
                                    <div className="font-bold text-sm text-gray-700">{(unit.values.voc * 10).toFixed(1)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400">황화수소</div>
                                    <div className="font-bold text-sm text-gray-700">{unit.values.h2s}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400">암모니아</div>
                                    <div className="font-bold text-sm text-gray-700">{unit.values.nh3}</div>
                                </div>
                            </div>

                            {/* Footer Status */}
                            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-2">
                                <div className="flex items-center gap-1"><Battery size={12} /> 85%</div>
                                <div className="flex items-center gap-1"><Signal size={12} /> LTE Strong</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileMonitoring;
