import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Save, Trash2, MapPin, Activity, Settings } from 'lucide-react';
import LocationPickerModal from '../../components/Common/LocationPickerModal';

interface ReductionFacility {
    id: string;
    name: string;
    type: 'Biochemical' | 'Activated Carbon' | 'Biofilter' | 'Plasma'; // Approx types from KR
    location: string;
    lat: number;
    lon: number;
    capacity: string;
    installDate: string;
    company: string;
    manager: string;
    // Operational Status
    mode: 'AUTO' | 'MANUAL';
    status: 'NORMAL' | 'STOP' | 'ERROR';
    isRunning: boolean;
}

const MOCK_FACILITIES: ReductionFacility[] = [
    { id: 'FAC-001', name: '백운광장 저감장치', type: 'Biochemical', location: '백운동 123-4', lat: 35.129, lon: 126.912, capacity: '100CMM', installDate: '2023-01-15', company: '환경기술(주)', manager: '김철수', mode: 'AUTO', status: 'NORMAL', isRunning: true },
    { id: 'FAC-002', name: '봉선시장 저감장치', type: 'Activated Carbon', location: '봉선동 55', lat: 35.125, lon: 126.915, capacity: '50CMM', installDate: '2023-03-20', company: '맑은공기(주)', manager: '이영희', mode: 'MANUAL', status: 'STOP', isRunning: false },
    { id: 'FAC-003', name: '효덕동 주민센터 앞', type: 'Biofilter', location: '효덕동 99', lat: 35.118, lon: 126.908, capacity: '80CMM', installDate: '2022-11-05', company: '에코시스템', manager: '박준호', mode: 'AUTO', status: 'NORMAL', isRunning: true },
    { id: 'FAC-004', name: '진월동 공영주차장', type: 'Biochemical', location: '진월동 12', lat: 35.120, lon: 126.910, capacity: '100CMM', installDate: '2023-06-10', company: '환경기술(주)', manager: '최민수', mode: 'AUTO', status: 'ERROR', isRunning: false },
];

const ReductionFacilityList: React.FC = () => {
    const [facilities, setFacilities] = useState<ReductionFacility[]>(MOCK_FACILITIES);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ReductionFacility>>({});
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // Select first item on load
    useEffect(() => {
        if (facilities.length > 0 && !selectedId) {
            handleSelect(facilities[0]);
        }
    }, []);

    const handleSelect = (facility: ReductionFacility) => {
        setSelectedId(facility.id);
        setFormData({ ...facility });
    };

    const handleNew = () => {
        setSelectedId(null);
        setFormData({
            id: '',
            name: '',
            type: 'Biochemical',
            location: '',
            lat: 35.127,
            lon: 126.911,
            capacity: '',
            installDate: new Date().toISOString().split('T')[0], // Default: Today
            company: '',
            manager: '',
            mode: 'AUTO',
            status: 'STOP',
            isRunning: false
        });
    };

    const handleLocationSelect = (lat: number, lon: number, addr: string) => {
        setFormData(prev => ({ ...prev, lat, lon, location: addr }));
    };

    const handleSave = () => {
        if (!formData.name) return alert('시설명을 입력해주세요.');

        if (selectedId) {
            // Update
            setFacilities(prev => prev.map(f => f.id === selectedId ? { ...f, ...formData } as ReductionFacility : f));
            alert('수정되었습니다.');
        } else {
            // Create
            const newId = `FAC-${String(facilities.length + 1).padStart(3, '0')}`;
            const newFacility = { ...formData, id: newId } as ReductionFacility;
            setFacilities(prev => [...prev, newFacility]);
            setSelectedId(newId);
            setFormData(newFacility);
            alert('등록되었습니다.');
        }
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setFacilities(prev => prev.filter(f => f.id !== selectedId));
            if (facilities.length > 1) {
                handleSelect(facilities[0]);
            } else {
                handleNew();
            }
        }
    };

    return (
        <div className="flex h-full gap-4">
            {/* Left: Facility List (60%) */}
            <div className="w-[60%] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center justify-between bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700">시설 목록</span>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <input type="text" placeholder="시설명 검색" className="border border-gray-300 rounded px-2 py-1.5 text-sm w-48 outline-none focus:border-blue-500" />
                        <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-900 flex items-center gap-1">
                            <Search size={14} /> 조회
                        </button>
                    </div>
                    <button className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
                        <Download size={14} /> 엑셀
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 z-10 border-b border-gray-200">
                            <tr>
                                <th className="p-3 w-16 text-center">No</th>
                                <th className="p-3">시설명</th>
                                <th className="p-3">위치</th>
                                <th className="p-3">기술유형</th>
                                <th className="p-3 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {facilities.map((fac, idx) => (
                                <tr
                                    key={fac.id}
                                    className={`hover:bg-blue-50 transition-colors cursor-pointer ${selectedId === fac.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleSelect(fac)}
                                >
                                    <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                    <td className="p-3 font-medium text-gray-800">{fac.name}</td>
                                    <td className="p-3 text-gray-600 truncate max-w-[150px]">{fac.location}</td>
                                    <td className="p-3 text-gray-600">
                                        {fac.type === 'Biochemical' && '약액세정식'}
                                        {fac.type === 'Activated Carbon' && '활성탄흡착식'}
                                        {fac.type === 'Biofilter' && '바이오필터'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${fac.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                                            fac.status === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {fac.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right: Details & Control (40%) */}
            <div className="w-[40%] flex flex-col gap-4">
                {/* 1. Information Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Settings size={18} className="text-blue-600" />
                            {selectedId ? '시설 상세 정보 수정' : '신규 시설 등록'}
                        </h3>
                        <button
                            onClick={handleNew}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 flex items-center gap-1 shadow-sm"
                        >
                            <Plus size={14} /> 신규 등록
                        </button>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">시설명</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="시설명을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">관리 ID</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500"
                                    value={formData.id || '자동 생성'}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">기술 유형</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.type || 'Biochemical'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="Biochemical">약액세정식</option>
                                    <option value="Activated Carbon">활성탄흡착식</option>
                                    <option value="Biofilter">바이오필터</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">설치 장소</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                        value={formData.location || ''}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="주소 입력"
                                    />
                                    <button
                                        onClick={() => setIsPickerOpen(true)}
                                        className="bg-gray-100 border border-gray-300 px-3 rounded hover:bg-gray-200"
                                    >
                                        <MapPin size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">처리 용량</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.capacity || ''}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    placeholder="예: 100CMM"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">설치 일자</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.installDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">시공 업체</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.company || ''}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">관리 책임자</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.manager || ''}
                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Status Read-only View */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                                <Activity size={14} /> 현재 운영 상태
                            </h4>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                    <span className="text-xs text-gray-400 block mb-1">운전 모드</span>
                                    <span className={`font-bold ${formData.mode === 'AUTO' ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {formData.mode === 'AUTO' ? 'AUTO (자동)' : 'MANUAL (수동)'}
                                    </span>
                                </div>
                                <div className="flex-1 bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                    <span className="text-xs text-gray-400 block mb-1">가동 상태</span>
                                    <span className={`font-bold ${formData.status === 'NORMAL' ? 'text-green-600' :
                                            formData.status === 'ERROR' ? 'text-red-600' : 'text-gray-500'
                                        }`}>
                                        {formData.status === 'NORMAL' ? '정상 (NORMAL)' :
                                            formData.status === 'ERROR' ? '이상 (ERROR)' : '정지 (STOP)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
                        {selectedId && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-50 text-sm font-medium transition-colors"
                            >
                                <Trash2 size={16} /> 삭제
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow-sm text-sm font-bold transition-colors"
                        >
                            <Save size={16} /> {selectedId ? '변경사항 저장' : '신규 등록'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Location Utility */}
            <LocationPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleLocationSelect}
                initialLat={formData.lat}
                initialLon={formData.lon}
            />
        </div>
    );
};

export default ReductionFacilityList;
