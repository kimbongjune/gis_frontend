import React, { useState } from 'react';
import { Plus, Save, Trash2, MapPin, Search } from 'lucide-react';
import LocationPickerModal from '../../components/Common/LocationPickerModal';

interface FacilityData {
    id: string;
    name: string;
    location: string; // Address or simple location name
    lat: number;
    lon: number;
    installDate: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'DISCONNECT';
    items: string[]; // e.g., ['H2S', 'NH3']
    threshold_h2s: number;
    threshold_nh3: number;
    sensitivity: number; // 0-100% or similar
}

const MeasurementFacility: React.FC = () => {
    // Mock Data
    const [sensors, setSensors] = useState<FacilityData[]>([
        { id: 'S001', name: '백운광장 1', location: '백운동 12-3', lat: 35.129, lon: 126.912, installDate: '2023-05-10', status: 'NORMAL', items: ['H2S', 'NH3'], threshold_h2s: 0.5, threshold_nh3: 10, sensitivity: 90 },
        { id: 'S002', name: '봉선시장 입구', location: '봉선동 88-1', lat: 35.125, lon: 126.915, installDate: '2022-11-20', status: 'WARNING', items: ['H2S', 'NH3', 'VOC'], threshold_h2s: 0.5, threshold_nh3: 10, sensitivity: 85 },
        { id: 'S003', name: '진월동 합류관', location: '진월동 45-2', lat: 35.118, lon: 126.908, installDate: '2024-01-15', status: 'NORMAL', items: ['H2S'], threshold_h2s: 1.0, threshold_nh3: 15, sensitivity: 95 },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [formData, setFormData] = useState<FacilityData>({
        id: '', name: '', location: '', lat: 35.127, lon: 126.911,
        installDate: new Date().toISOString().split('T')[0],
        status: 'NORMAL', items: ['H2S', 'NH3'],
        threshold_h2s: 0.5, threshold_nh3: 10, sensitivity: 90
    });

    const handleSelect = (s: FacilityData) => {
        setSelectedId(s.id);
        setFormData({ ...s });
    };

    const handleNew = () => {
        setSelectedId(null);
        setFormData({
            id: '', name: '', location: '', lat: 35.127, lon: 126.911,
            installDate: new Date().toISOString().split('T')[0],
            status: 'NORMAL', items: ['H2S', 'NH3'],
            threshold_h2s: 0.5, threshold_nh3: 10, sensitivity: 90
        });
    };

    const handleLocationSelect = (lat: number, lon: number, addr: string) => {
        setFormData(prev => ({ ...prev, lat, lon, location: addr }));
    };

    const handleSave = () => {
        if (!formData.name) {
            alert('시설명을 입력해주세요.');
            return;
        }

        if (selectedId) {
            // Update
            setSensors(prev => prev.map(s => s.id === selectedId ? formData : s));
            alert('수정되었습니다.');
        } else {
            // Create
            const newId = `S00${sensors.length + 1}`;
            const newSensor = { ...formData, id: newId };
            setSensors(prev => [...prev, newSensor]);
            setFormData(newSensor);
            setSelectedId(newId);
            alert('신규 등록되었습니다.');
        }
    };

    const handleDelete = () => {
        if (!selectedId) return;
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setSensors(prev => prev.filter(s => s.id !== selectedId));
            handleNew(); // Reset form
            alert('삭제되었습니다.');
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left: List Table */}
            <div className="w-[60%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Search size={18} /> 측정시설 목록
                    </h3>
                    <button onClick={handleNew} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={14} /> 신규 등록
                    </button>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">센서 ID</th>
                                <th className="px-4 py-3">시설명</th>
                                <th className="px-4 py-3">설치 위치</th>
                                <th className="px-4 py-3">설치일</th>
                                <th className="px-4 py-3 text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sensors.map(s => (
                                <tr
                                    key={s.id}
                                    onClick={() => handleSelect(s)}
                                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedId === s.id ? 'bg-blue-50' : ''}`}
                                >
                                    <td className="px-4 py-3 font-mono text-gray-600">{s.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.location}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.installDate}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                            ${s.status === 'NORMAL' ? 'bg-green-100 text-green-700' :
                                                s.status === 'WARNING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                    총 {sensors.length}개의 측정시설이 등록되어 있습니다.
                </div>
            </div>

            {/* Right: Detail Form */}
            <div className="w-[40%] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-gray-800">
                        {selectedId ? '시설 상세 정보 수정' : '신규 측정기 등록'}
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-blue-500 pl-2">기본 정보</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">센서 ID</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 p-2 rounded text-sm bg-gray-50"
                                    value={formData.id}
                                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    placeholder="자동 생성"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1">시설명</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 p-2 rounded text-sm focus:border-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1">설치 위치 (주소)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 p-2 rounded text-sm focus:border-blue-500 outline-none"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                    <button
                                        onClick={() => setIsPickerOpen(true)}
                                        className="bg-gray-100 border border-gray-300 p-2 rounded text-gray-600 hover:bg-gray-200"
                                    >
                                        <MapPin size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">설치일자</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 p-2 rounded text-sm"
                                    value={formData.installDate}
                                    onChange={e => setFormData({ ...formData, installDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">운영 상태</label>
                                <select
                                    className="w-full border border-gray-300 p-2 rounded text-sm"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="NORMAL">정상 (NORMAL)</option>
                                    <option value="WARNING">주의 (WARNING)</option>
                                    <option value="CRITICAL">위험 (CRITICAL)</option>
                                    <option value="DISCONNECT">통신장애</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Sensor Config */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-orange-500 pl-2">센서 설정 및 임계치</h4>

                        <div className="bg-orange-50 p-4 rounded border border-orange-100 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">H₂S 경보 (ppm)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full border border-orange-200 p-2 rounded text-sm text-right font-mono"
                                        value={formData.threshold_h2s}
                                        onChange={e => setFormData({ ...formData, threshold_h2s: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-orange-800 mb-1">NH₃ 경보 (ppm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full border border-orange-200 p-2 rounded text-sm text-right font-mono"
                                        value={formData.threshold_nh3}
                                        onChange={e => setFormData({ ...formData, threshold_nh3: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-orange-800 mb-1">센서 민감도 (%)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                                        value={formData.sensitivity}
                                        onChange={e => setFormData({ ...formData, sensitivity: parseInt(e.target.value) })}
                                    />
                                    <span className="font-mono text-sm w-12 text-right">{formData.sensitivity}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
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
                        <Save size={16} /> 저장
                    </button>
                </div>
            </div>

            {/* Modals */}
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

export default MeasurementFacility;
