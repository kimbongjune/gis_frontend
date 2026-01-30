import React, { useState, useEffect } from 'react';
import { Facility } from '../../types';

// Mock Data
const MOCK_FACILITIES: Facility[] = [
    { id: 'FAC-001', name: '백운광장 저감장치', region: '백운동', status: 'RUNNING', connectionStatus: 'CONNECTED', mode: 'AUTO', lastCommunicationTime: '2023-10-25 14:30:00', powerUsage: 12.5, chemicalLevel: 80 },
    { id: 'FAC-002', name: '봉선시장 저감장치', region: '봉선동', status: 'STOPPED', connectionStatus: 'CONNECTED', mode: 'MANUAL', lastCommunicationTime: '2023-10-25 14:28:00', powerUsage: 0, chemicalLevel: 45 },
    { id: 'FAC-003', name: '효덕동 주민센터 앞', region: '효덕동', status: 'ERROR', connectionStatus: 'DISCONNECTED', mode: 'AUTO', lastCommunicationTime: '2023-10-25 10:00:00', powerUsage: 0, chemicalLevel: 10 },
];

const MOCK_USER = { id: 'user1', role: 'OPERATOR' };

const FacilityControl: React.FC = () => {
    const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
    const [selectedId, setSelectedId] = useState<string>('FAC-001'); // Ensure default is valid
    const [filters, setFilters] = useState({ region: '', name: '', status: 'ALL' });

    // Control Logic State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<'AUTO' | 'MANUAL' | null>(null);
    const [isControlling, setIsControlling] = useState(false);

    const selectedFacility = facilities.find(f => f.id === selectedId) || null;

    // Permission Check
    useEffect(() => {
        if (MOCK_USER.role !== 'OPERATOR') {
            alert('접근 권한이 없습니다. (운영자 전용)');
        }
    }, []);

    // Filter Logic
    const filteredFacilities = facilities.filter(f => {
        return (
            (filters.region === '' || f.region === filters.region) &&
            (filters.name === '' || f.name.includes(filters.name)) &&
            (filters.status === 'ALL' || f.status === filters.status)
        );
    });

    const handleModeToggle = () => {
        if (!selectedFacility) return;
        const nextMode = selectedFacility.mode === 'AUTO' ? 'MANUAL' : 'AUTO';
        setPendingMode(nextMode);
        setIsModalOpen(true);
    };

    const confirmModeChange = async () => {
        if (!selectedFacility || !pendingMode) return;
        setIsModalOpen(false);

        // API Call Simulation
        setFacilities(prev => prev.map(f => f.id === selectedId ? { ...f, mode: pendingMode } : f));
    };

    const handleControlCommand = async (command: 'START' | 'STOP' | 'RESET') => {
        if (!selectedFacility) return;
        // ... same logic
        setIsControlling(true);
        setTimeout(() => {
            let newStatus: Facility['status'] = selectedFacility.status;
            if (command === 'START') newStatus = 'RUNNING';
            if (command === 'STOP') newStatus = 'STOPPED';
            if (command === 'RESET') newStatus = 'STOPPED';

            setFacilities(prev => prev.map(f => f.id === selectedId ? { ...f, status: newStatus } : f));
            setIsControlling(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col w-full h-full bg-gray-50 p-6 gap-6 min-h-[600px]">
            {/* Breadcrumb - removed local since layout has it? No, keep logic if needed or rely on Layout.
          Actually, I'll keep the two-pane layout but ensure explicit height */}

            <div className="flex flex-col md:flex-row w-full h-[800px] gap-6">

                {/* Left: Facility List (30%) */}
                <div className="w-full md:w-[30%] bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg shrink-0">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">시설 목록</h2>
                        <div className="flex flex-col gap-2">
                            <select
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                value={filters.region}
                                onChange={e => setFilters({ ...filters, region: e.target.value })}
                            >
                                <option value="">전체 읍면동</option>
                                <option value="백운동">백운동</option>
                                <option value="봉선동">봉선동</option>
                                <option value="효덕동">효덕동</option>
                            </select>
                            <input
                                type="text"
                                placeholder="시설명 검색"
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                value={filters.name}
                                onChange={e => setFilters({ ...filters, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredFacilities.map(facility => (
                            <div
                                key={facility.id}
                                onClick={() => setSelectedId(facility.id)}
                                className={`p-3 border-b last:border-0 cursor-pointer hover:bg-blue-50 transition-colors flex justify-between items-center ${selectedId === facility.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                            >
                                <div>
                                    <div className="font-medium text-gray-800 text-sm">{facility.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{facility.region} | {facility.lastCommunicationTime.split(' ')[1]}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {facility.connectionStatus === 'DISCONNECTED' ? (
                                        <span className="w-2 h-2 bg-gray-400 rounded-full" title="통신불량"></span>
                                    ) : facility.status === 'RUNNING' ? (
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="가동중"></span>
                                    ) : facility.status === 'ERROR' ? (
                                        <span className="w-2 h-2 bg-red-500 rounded-full" title="오류"></span>
                                    ) : (
                                        <span className="w-2 h-2 bg-yellow-400 rounded-full" title="정지"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Control Panel (70%) */}
                {selectedFacility ? (
                    <div className="w-full md:w-[70%] bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    {selectedFacility.name}
                                    <span className={`text-sm px-2 py-0.5 rounded-full border ${selectedFacility.status === 'RUNNING' ? 'bg-green-100 text-green-700 border-green-200' : selectedFacility.status === 'ERROR' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {selectedFacility.status === 'RUNNING' ? '가동중' : selectedFacility.status === 'ERROR' ? '점검요망' : '대기중'}
                                    </span>
                                </h2>
                                <div className="text-sm text-gray-500 mt-1">
                                    최종 통신: {selectedFacility.lastCommunicationTime} ({selectedFacility.connectionStatus === 'CONNECTED' ? '정상' : '끊김'})
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded shadow-sm border border-gray-100">
                                <span className="text-sm font-semibold text-gray-700">운전 모드</span>
                                <button
                                    onClick={handleModeToggle}
                                    className={`relative w-14 h-7 rounded-full transition-colors flex items-center px-1 ${selectedFacility.mode === 'AUTO' ? 'bg-indigo-600' : 'bg-gray-400'}`}
                                >
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${selectedFacility.mode === 'AUTO' ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                </button>
                                <span className="text-sm font-bold w-12 text-center text-gray-800">{selectedFacility.mode === 'AUTO' ? '자동' : '수동'}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col gap-8 overflow-y-auto">
                            {/* Status Monitoring */}
                            <div className="grid grid-cols-2 gap-6 h-48">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col justify-between shadow-sm">
                                    <h3 className="text-sm font-bold text-blue-800">⚡ 전력 사용량 (실시간)</h3>
                                    <div className="text-right">
                                        <div className="text-4xl font-extrabold text-blue-900">{selectedFacility.powerUsage} <span className="text-lg font-normal text-blue-600">kW</span></div>
                                    </div>
                                </div>

                                <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 flex flex-col justify-between shadow-sm">
                                    <h3 className="text-sm font-bold text-teal-800">💧 약품 잔량</h3>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2 font-semibold">
                                            <span>현재 잔량</span>
                                            <span>{selectedFacility.chemicalLevel}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${selectedFacility.chemicalLevel < 20 ? 'bg-red-500' : 'bg-teal-500'}`}
                                                style={{ width: `${selectedFacility.chemicalLevel}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Controls */}
                            <div className="border-t border-gray-100 pt-8 mt-auto mb-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    수동 제어 패널
                                    {selectedFacility.mode === 'AUTO' && <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">⚠️ 자동 모드에서는 제어할 수 없습니다.</span>}
                                </h3>

                                <div className="grid grid-cols-3 gap-6">
                                    <button
                                        disabled={selectedFacility.mode === 'AUTO' || isControlling}
                                        onClick={() => handleControlCommand('START')}
                                        className="h-20 rounded-xl bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 text-white text-lg font-bold shadow-md transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                                    >
                                        <span>가동 시작</span>
                                        {isControlling && <span className="text-xs font-normal animate-pulse">전송중...</span>}
                                    </button>
                                    <button
                                        disabled={selectedFacility.mode === 'AUTO' || isControlling}
                                        onClick={() => handleControlCommand('STOP')}
                                        className="h-20 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-300 text-white text-lg font-bold shadow-md transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                                    >
                                        <span>가동 정지</span>
                                    </button>
                                    <button
                                        disabled={selectedFacility.mode === 'AUTO' || isControlling}
                                        onClick={() => handleControlCommand('RESET')}
                                        className="h-20 rounded-xl bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-400 text-lg font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                                    >
                                        <span>초기화</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="w-[70%] flex items-center justify-center text-gray-400 bg-white rounded-lg border border-gray-200">
                        시설을 선택해주세요.
                    </div>
                )}
            </div>

            {/* Mode Change Confirm Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-96 p-6 animate-in fade-in zoom-in duration-200 transform scale-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">운전 모드 변경 확인</h3>
                        <p className="text-gray-600 mb-6">
                            정말로 운전 모드를 <br />
                            <span className="font-bold text-xl text-indigo-600">{pendingMode === 'AUTO' ? '자동(Auto)' : '수동(Manual)'}</span> 으로 전환하시겠습니까?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium border border-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmModeChange}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-sm transition-colors font-bold"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilityControl;
