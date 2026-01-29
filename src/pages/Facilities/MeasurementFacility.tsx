import React, { useState } from 'react';
import { Plus, Save, Trash2, MapPin } from 'lucide-react';

const MeasurementFacility: React.FC = () => {
    const [sensors, setSensors] = useState([
        { id: 'S001', name: '백운광장 1', model: 'ODOR-X1', lat: 35.129, lon: 126.912, threshold_h2s: 0.5, threshold_nh3: 10 },
        { id: 'S002', name: '봉선시장 입구', model: 'ODOR-PRO', lat: 35.125, lon: 126.915, threshold_h2s: 0.5, threshold_nh3: 10 },
    ]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({ name: '', model: '', lat: 0, lon: 0, threshold_h2s: 0, threshold_nh3: 0 });

    const handleSelect = (s: any) => {
        setSelectedId(s.id);
        setFormData(s);
    };

    const handleNew = () => {
        setSelectedId(null);
        setFormData({ name: '', model: '', lat: 35.127, lon: 126.911, threshold_h2s: 0.5, threshold_nh3: 10 });
    };

    return (
        <div className="flex h-full gap-6">
            {/* List */}
            <div className="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">측정기 목록</h3>
                    <button onClick={handleNew} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                        <Plus size={14} /> 신규 등록
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {sensors.map(s => (
                        <div
                            key={s.id}
                            onClick={() => handleSelect(s)}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 rounded ${selectedId === s.id ? 'bg-blue-50 border-blue-200' : 'border-gray-100'}`}
                        >
                            <div className="font-bold text-gray-800">{s.name}</div>
                            <div className="text-xs text-gray-400 mt-1">ID: {s.id} | Model: {s.model}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">
                    {selectedId ? '상세 정보 수정' : '신규 측정기 등록'}
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">센서명</label>
                        <input type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">모델명</label>
                        <input type="text" className="w-full border p-2 rounded" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">위도 (Latitude)</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.lat} onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">경도 (Longitude)</label>
                        <input type="number" className="w-full border p-2 rounded" value={formData.lon} onChange={e => setFormData({ ...formData, lon: parseFloat(e.target.value) })} />
                    </div>
                </div>

                <div className="bg-orange-50 p-4 rounded mb-6 border border-orange-100">
                    <h4 className="text-sm font-bold text-orange-800 mb-3">경보 임계치 설정 (Threshold)</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">H₂S 경보 기준 (ppm)</label>
                            <input type="number" className="w-full border p-2 rounded bg-white" value={formData.threshold_h2s} onChange={e => setFormData({ ...formData, threshold_h2s: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">NH₃ 경보 기준 (ppm)</label>
                            <input type="number" className="w-full border p-2 rounded bg-white" value={formData.threshold_nh3} onChange={e => setFormData({ ...formData, threshold_nh3: parseFloat(e.target.value) })} />
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex justify-end gap-3 pt-6 border-t">
                    {selectedId && (
                        <button className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
                            <Trash2 size={16} /> 삭제
                        </button>
                    )}
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow-sm font-bold">
                        <Save size={16} /> 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeasurementFacility;
