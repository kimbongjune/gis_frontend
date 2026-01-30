import React, { useState, useRef } from 'react';
import {
    Settings, DollarSign, FileText, AlertCircle, Upload,
    Plus, Save, Trash2, Search, Calendar, Box, Activity
} from 'lucide-react';

// --- Interfaces ---
interface Asset {
    id: string;
    name: string;
    model: string;
    manufacturer: string;
    installDate: string; // YYYY-MM-DD
    replaceDate: string; // YYYY-MM-DD
    status: 'OPERATING' | 'REPAIR' | 'DISCARD' | 'UNKNOWN';
    budget: number; // Cost
    imgUrl?: string; // Mock
}

// --- Mock Data ---
const MOCK_ASSETS: Asset[] = [
    { id: 'EQ-23-001', name: '송풍기 #1', model: 'TURBO-2000', manufacturer: '바람테크', installDate: '2023-01-20', replaceDate: '2028-01-20', status: 'OPERATING', budget: 5000000 },
    { id: 'EQ-23-002', name: '순환펌프 A', model: 'PUMP-XS', manufacturer: '물나라', installDate: '2023-02-15', replaceDate: '2027-02-15', status: 'REPAIR', budget: 3500000 },
    { id: 'EQ-22-015', name: '수위센서 B', model: 'SENS-L2', manufacturer: '센서코리아', installDate: '2022-11-10', replaceDate: '2025-11-10', status: 'OPERATING', budget: 120000 },
    { id: 'EQ-21-008', name: '제어반 C', model: 'PNL-M', manufacturer: '일렉트릭', installDate: '2021-06-30', replaceDate: '2031-06-30', status: 'OPERATING', budget: 8500000 },
    { id: 'EQ-20-099', name: '배관 D', model: 'PIPE-STS', manufacturer: '스틸파이프', installDate: '2020-03-01', replaceDate: '2040-03-01', status: 'DISCARD', budget: 2000000 },
];

const AssetInventory: React.FC = () => {
    // --- State ---
    const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Asset>({
        id: '', name: '', model: '', manufacturer: '',
        installDate: '', replaceDate: '', status: 'OPERATING', budget: 0, imgUrl: undefined
    });
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Derived Data ---
    const filteredAssets = assets.filter(a =>
        a.name.includes(searchTerm) || a.model.includes(searchTerm) || a.manufacturer.includes(searchTerm)
    );

    const totalBudget = assets.reduce((sum, a) => sum + a.budget, 0); // Mock Logic for Total Asset Value
    const replaceYearFilter = new Date().getFullYear() + 1; // Next Year
    const replaceCount = assets.filter(a => a.replaceDate.startsWith(replaceYearFilter.toString())).length;

    // --- Handlers ---
    const handleRowClick = (asset: Asset) => {
        setSelectedAssetId(asset.id);
        setFormData({ ...asset });
    };

    const handleNewClick = () => {
        setSelectedAssetId(null);
        setFormData({
            id: '', name: '', model: '', manufacturer: '',
            installDate: new Date().toISOString().split('T')[0],
            replaceDate: '', status: 'OPERATING', budget: 0, imgUrl: undefined
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = () => {
        if (!selectedAssetId) {
            // Create
            const newId = `EQ-${new Date().getFullYear().toString().slice(2)}-${Math.floor(Math.random() * 1000)}`;
            setAssets([...assets, { ...formData, id: newId }]);
            alert('새로운 자산이 등록되었습니다.');
        } else {
            // Update
            setAssets(assets.map(a => a.id === selectedAssetId ? formData : a));
            alert('자산 정보가 수정되었습니다.');
        }
    };

    const handleDelete = () => {
        if (!selectedAssetId) return;
        if (confirm('정말 삭제하시겠습니까?')) {
            setAssets(assets.filter(a => a.id !== selectedAssetId));
            handleNewClick();
        }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imgUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4 bg-gray-50 p-4">

            {/* Top Cards: Budget & Status Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold mb-1">총 자산 가치</p>
                        <p className="text-xl font-bold text-gray-800">{totalBudget.toLocaleString()} 원</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold mb-1">총 등록 장비</p>
                        <p className="text-xl font-bold text-gray-800">{assets.length} 대</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full"><Box size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold mb-1">교체 예정 ({replaceYearFilter}년)</p>
                        <p className="text-xl font-bold text-red-600">{replaceCount} 대</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-full"><Calendar size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold mb-1">올해 집행 예산</p>
                        <p className="text-xl font-bold text-blue-600">45,000,000 원</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><Activity size={24} /></div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex flex-1 gap-4 overflow-hidden">

                {/* LEFT: Asset List Table */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Settings size={18} /> 자산 목록
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="장비명, 제조사 검색"
                                    className="pl-9 pr-3 py-1.5 border rounded text-sm outline-none focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600">장비명</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">설치일</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">상태</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">자산가액</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">제조사</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">교체예정일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAssets.map(asset => (
                                    <tr
                                        key={asset.id}
                                        onClick={() => handleRowClick(asset)}
                                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedAssetId === asset.id ? 'bg-blue-100' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">{asset.name} <span className="text-xs text-gray-400 font-normal">({asset.model})</span></td>
                                        <td className="px-4 py-3 text-gray-600">{asset.installDate}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${asset.status === 'OPERATING' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'REPAIR' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.status === 'OPERATING' ? '운용중' :
                                                    asset.status === 'REPAIR' ? '수리중' : '폐기'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{asset.budget.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-600">{asset.manufacturer}</td>
                                        <td className="px-4 py-3 text-gray-600">{asset.replaceDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: Detail & Form */}
                <div className="w-[350px] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">
                            {selectedAssetId ? '자산 상세 정보' : '신규 자산 등록'}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={handleNewClick} className="p-1.5 bg-white border rounded shadow-sm hover:bg-gray-100 text-blue-600" title="신규">
                                <Plus size={16} />
                            </button>
                            {selectedAssetId && (
                                <button onClick={handleDelete} className="p-1.5 bg-white border rounded shadow-sm hover:bg-red-50 text-red-600" title="삭제">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Image Placeholder */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300 relative group overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            {formData.imgUrl ? (
                                <img src={formData.imgUrl} alt="Asset Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    {selectedAssetId ? <Upload size={24} className="mb-2" /> : <Plus size={24} className="mb-2" />}
                                    <span className="text-xs">
                                        {selectedAssetId ? '사진 변경' : '사진 등록'}
                                    </span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">장비명</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="예: 송풍기 #1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">모델 / 규격</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="예: TURBO-2000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">설치일</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                        value={formData.installDate}
                                        onChange={e => setFormData({ ...formData, installDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">교체 예정일</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                        value={formData.replaceDate}
                                        onChange={e => setFormData({ ...formData, replaceDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">제조사</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.manufacturer}
                                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                                    placeholder="제조사명"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">자산 가액 (원)</label>
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">상태</label>
                                <select
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="OPERATING">운용중</option>
                                    <option value="REPAIR">수리중</option>
                                    <option value="DISCARD">폐기/불용</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2 mt-2"
                        >
                            <Save size={18} />
                            {selectedAssetId ? '정보 수정 (저장)' : '신규 등록'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetInventory;
