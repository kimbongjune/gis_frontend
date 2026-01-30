import React, { useState } from 'react';
import { Battery, Signal, Smartphone, Bell, X, ChevronDown, AlertTriangle, Activity } from 'lucide-react';
import DashboardMap from '../../components/Dashboard/DashboardMap';
import { SensorData, ComplaintData } from '../../types';

const MobileMonitoring: React.FC = () => {
    // Mock Data
    const [units] = useState<SensorData[]>([
        { sensor_id: 'M-001', name: '현장팀 A (김반장)', grade: 1, status: 'NORMAL', latitude: 35.130, longitude: 126.913, values: { h2s: 0.0, nh3: 0.2, voc: 0.1 }, timestamp: '2023-10-25 14:05' },
        { sensor_id: 'M-002', name: '현장팀 B (이주임)', grade: 2, status: 'ALARM', latitude: 35.126, longitude: 126.916, values: { h2s: 0.5, nh3: 2.1, voc: 1.2 }, timestamp: '2023-10-25 14:02' },
        { sensor_id: 'M-003', name: '이동형 측정차량 1호', grade: 1, status: 'NORMAL', latitude: 35.128, longitude: 126.910, values: { h2s: 0.0, nh3: 0.5, voc: 0.3 }, timestamp: '2023-10-25 14:10' },
    ]);

    const [complaints] = useState<ComplaintData[]>([
        { reporterName: '박시민', contact: '010-1234-5678', title: '남구청 앞 악취 신고', content: '하수구 냄새가 너무 심하게 납니다.', address: '광주 남구 봉선동 123', latitude: 35.129, longitude: 126.915, status: 'RECEIVED', timestamp: '2023-10-25 13:50' },
        { reporterName: '김주민', contact: '010-9876-5432', title: '맨홀 역류 의심', content: '맨홀 뚜껑 주변에 물이 고여있고 냄새가 납니다.', address: '광주 남구 주월동 456', latitude: 35.125, longitude: 126.912, status: 'PROCESSING', timestamp: '2023-10-25 14:15' },
    ]);

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [pushNotification, setPushNotification] = useState<{ title: string, message: string } | null>(null);

    // Metrics
    const alarmCount = units.filter(u => u.status === 'ALARM').length;
    const complaintCount = complaints.length;
    const totalIncidents = alarmCount + complaintCount + 15; // Mock total historical count

    // Simulate Push Notification
    const triggerPush = () => {
        setPushNotification({
            title: '⚠️ 악취 경보 발생!',
            message: '현장팀 B (이주임) 구역에서 고농도 악취가 감지되었습니다.'
        });
        setTimeout(() => setPushNotification(null), 5000);
    };

    return (
        <div className="relative w-full h-[calc(100vh-160px)] bg-gray-100 flex flex-col overflow-hidden rounded-b-xl border-b border-gray-200">

            {/* Top Area: Status Summary Card (Static, Non-overlapping) */}
            <div className="shrink-0 p-4 pb-2 z-10 bg-gray-100">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            실시간 모니터링 현황
                        </h2>
                        <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                            {new Date().toLocaleTimeString()} 기준
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-medium mb-1">금일 발생</span>
                            <span className="text-lg font-bold text-gray-800 leading-none">{totalIncidents}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-medium mb-1">민원 접수</span>
                            <span className="text-lg font-bold text-purple-600 leading-none">{complaintCount}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-500 font-medium mb-1">현재 경보</span>
                            <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-red-600 animate-pulse leading-none">{alarmCount}</span>
                                {alarmCount > 0 && <AlertTriangle size={12} className="text-red-500" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Area: Map (Fills remaining space) */}
            <div className="flex-1 w-full relative border-t border-gray-200">
                <DashboardMap sensors={units} complaints={complaints} mode="mobile" />
            </div>

            {/* Floating Action Button (FAB) for Notifications - Bottom Right */}
            <button
                onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
                className="absolute bottom-8 right-6 z-20 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95"
            >
                {isBottomSheetOpen ? <ChevronDown size={28} /> : (
                    <div className="relative">
                        <Bell size={24} />
                        {alarmCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-600 animate-ping"></span>
                        )}
                        {alarmCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-600"></span>
                        )}
                    </div>
                )}
            </button>

            {/* Test Button for Push (Dev Only) */}
            <button
                onClick={triggerPush}
                className="absolute bottom-24 right-6 z-20 bg-gray-800/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
            >
                Test Push
            </button>

            {/* Bottom Sheet List Panel */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out z-30 flex flex-col max-h-[80vh] ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]' // Show a small handle/preview when closed? Or hide completely? User said "Bottom Notification Button" -> "New Status Display". Let's hide mainly but maybe leave a small peek or just rely on FAB. Let's rely on FAB for now to keep view clean.
                    // Actually, let's make it fully slide in/out based on state.
                    }`}
                style={{ transform: isBottomSheetOpen ? 'translateY(0)' : 'translateY(110%)' }}
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl" onClick={() => setIsBottomSheetOpen(false)}>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Smartphone size={18} /> 현장 모니터링 목록 ({units.length})
                    </h3>
                    <button onClick={() => setIsBottomSheetOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
                    {units.map(unit => (
                        <div
                            key={unit.sensor_id}
                            onClick={() => {
                                setSelectedUnitId(unit.sensor_id);
                                // Center map logic would be here (requires passing ref or callback)
                            }}
                            className={`p-4 rounded-xl border shadow-sm cursor-pointer transition-all bg-white ${selectedUnitId === unit.sensor_id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">{unit.name}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{unit.timestamp} 수신</div>
                                </div>
                                {unit.status === 'ALARM' ? (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded animate-pulse">경보</span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded">정상</span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-2 bg-gray-50 p-2 rounded-lg text-center">
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
                            <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-2">
                                <div className="flex items-center gap-1"><Battery size={10} /> 85%</div>
                                <div className="flex items-center gap-1"><Signal size={10} /> LTE Strong</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PUSH Notification Toast */}
            {pushNotification && (
                <div className="absolute top-20 left-4 right-4 z-50 animate-bounce-in">
                    <div className="bg-white/95 backdrop-blur shadow-2xl rounded-lg p-4 border-l-4 border-red-500 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                            <h4 className="text-red-600 font-bold flex items-center gap-2">
                                <AlertTriangle size={18} /> {pushNotification.title}
                            </h4>
                            <button onClick={() => setPushNotification(null)} className="text-gray-400">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700">{pushNotification.message}</p>
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => { setIsBottomSheetOpen(true); setPushNotification(null); }}
                                className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded font-bold shadow hover:bg-red-700"
                            >
                                현황 확인하기
                            </button>
                            <button
                                onClick={() => setPushNotification(null)}
                                className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 rounded font-bold hover:bg-gray-300"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMonitoring;
