import React, { useState, useEffect, useRef } from 'react';
import {
    Search, MapPin, Save, User, Phone, FileText,
    CheckCircle, Clock, AlertCircle, BarChart2, List, Paperclip
} from 'lucide-react';
import LocationPickerModal from '../../components/Common/LocationPickerModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import HeatmapLayer from 'ol/layer/Heatmap';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- TS Interfaces ---
interface Complaint {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    type: 'ODOR' | 'NOISE' | 'LEAK' | 'ETC';
    location: string;
    content: string;
    status: 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
    reporter: string;
    contact: string;
    manager: string;
    lat?: number;
    lon?: number;
}

// --- Mock Data ---
const MOCK_COMPLAINTS: Complaint[] = [
    { id: 'C20231025-001', date: '2023-10-25', time: '09:30', type: 'ODOR', location: '백운동 123-4', content: '하수구에서 심한 악취가 납니다.', status: 'RECEIVED', reporter: '김철수', contact: '010-1234-5678', manager: '박새로이', lat: 35.132, lon: 126.902 },
    { id: 'C20231024-005', date: '2023-10-24', time: '14:20', type: 'NOISE', location: '봉선동 45-1', content: '맨홀 뚜껑이 덜컹거려 소음이 심해요.', status: 'IN_PROGRESS', reporter: '이영희', contact: '010-9876-5432', manager: '조이서', lat: 35.130, lon: 126.905 },
    { id: 'C20231024-002', date: '2023-10-24', time: '10:15', type: 'LEAK', location: '주월동 88-9', content: '비가 오면 하수구가 역류합니다.', status: 'COMPLETED', reporter: '박민준', contact: '010-1111-2222', manager: '장근원', lat: 35.135, lon: 126.900 },
    { id: 'C20231023-011', date: '2023-10-23', time: '18:00', type: 'ODOR', location: '백운동 22-1', content: '저녁마다 냄새가 심해집니다.', status: 'COMPLETED', reporter: '최수진', contact: '010-3333-4444', manager: '박새로이', lat: 35.133, lon: 126.908 },
    { id: 'C20231023-008', date: '2023-10-23', time: '16:45', type: 'ETC', location: '진월동 56-7', content: '공사 잔해물이 남아있습니다.', status: 'REJECTED', reporter: '정우성', contact: '010-5555-6666', manager: '오수아', lat: 35.128, lon: 126.910 },
];

const ComplaintForm: React.FC = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'LIST' | 'STATS'>('LIST');
    const [mapMode, setMapMode] = useState<'MARKER' | 'HEATMAP'>('MARKER');
    const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const mapElement = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        id: null as string | null,
        reporter: '',
        contact: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5),
        type: 'ODOR',
        location: '',
        lat: 35.1272,
        lon: 126.9113,
        content: '',
        files: null as FileList | null
    });

    // Filter State
    const [filters, setFilters] = useState({
        dateStart: '',
        dateEnd: '',
        status: 'ALL',
        region: '',
        manager: '',
        search: ''
    });

    // --- Handlers ---
    const handleLocationSelect = (lat: number, lon: number, addr: string) => {
        setFormData(prev => ({ ...prev, location: addr, lat, lon }));
        setIsPickerOpen(false);
    };

    const resetForm = () => {
        setFormData({
            id: null,
            reporter: '', contact: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().substring(0, 5),
            type: 'ODOR',
            location: '', lat: 35.1272, lon: 126.9113,
            content: '', files: null
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.id) {
            // Update existing
            setComplaints(complaints.map(c =>
                c.id === formData.id ? {
                    ...c,
                    reporter: formData.reporter,
                    contact: formData.contact,
                    date: formData.date,
                    time: formData.time,
                    type: formData.type as any,
                    location: formData.location,
                    lat: formData.lat,
                    lon: formData.lon,
                    content: formData.content,
                    // Preserve other fields
                    manager: c.manager,
                    status: c.status
                } : c
            ));
            alert('민원 정보가 수정되었습니다.');
        } else {
            // Create new
            const newComplaint: Complaint = {
                id: `C${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${Math.floor(Math.random() * 100)}`,
                date: formData.date,
                time: formData.time,
                type: formData.type as any,
                location: formData.location,
                content: formData.content,
                status: 'RECEIVED',
                reporter: formData.reporter,
                contact: formData.contact,
                manager: '박새로이 (자동배정)', // Mock
                lat: formData.lat,
                lon: formData.lon
            };
            setComplaints([newComplaint, ...complaints]);
            alert('민원이 등록되었습니다.');
        }

        resetForm();
    };

    const handleManageClick = (complaint: Complaint) => {
        setFormData({
            id: complaint.id,
            reporter: complaint.reporter,
            contact: complaint.contact,
            date: complaint.date,
            time: complaint.time,
            type: complaint.type,
            location: complaint.location,
            lat: complaint.lat || 35.1272,
            lon: complaint.lon || 126.9113,
            content: complaint.content,
            files: null
        });
    };

    // Map Initialization
    useEffect(() => {
        if (activeTab === 'STATS' && mapElement.current) {

            // 1. Create Source from Data
            const vectorSource = new VectorSource();
            complaints.forEach(c => {
                if (c.lat && c.lon) {
                    const feature = new Feature({
                        geometry: new Point(fromLonLat([c.lon, c.lat])),
                        weight: 0.8 // For heatmap
                    });

                    // Style for Marker Mode
                    feature.setStyle(new Style({
                        image: new CircleStyle({
                            radius: 8,
                            fill: new Fill({ color: 'rgba(255, 0, 0, 0.6)' }),
                            stroke: new Stroke({ color: 'white', width: 2 })
                        })
                    }));

                    vectorSource.addFeature(feature);
                }
            });

            // 2. Create Layers
            const markerLayer = new VectorLayer({
                source: vectorSource,
                visible: mapMode === 'MARKER'
            });

            const heatmapLayer = new HeatmapLayer({
                source: vectorSource,
                blur: 15,
                radius: 10,
                weight: 'weight',
                visible: mapMode === 'HEATMAP'
            });

            // 3. Create Map
            const map = new Map({
                target: mapElement.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    markerLayer,
                    heatmapLayer
                ],
                view: new View({
                    center: fromLonLat([126.905, 35.132]), // Center of mock data
                    zoom: 14,
                }),
            });

            mapRef.current = map;

            return () => {
                map.setTarget(undefined);
            };
        }
    }, [activeTab, complaints, mapMode]); // Re-init when mode changes (Simpler than managing layer update separately)

    // --- Derived Data ---
    // --- Derived Data ---
    const filteredComplaints = complaints.filter(c => {
        const matchStatus = filters.status === 'ALL' || c.status === filters.status;
        const matchRegion = filters.region === '' || c.location.includes(filters.region);
        const matchManager = filters.manager === '' || c.manager.includes(filters.manager);
        const matchDateStart = filters.dateStart === '' || c.date >= filters.dateStart;
        const matchDateEnd = filters.dateEnd === '' || c.date <= filters.dateEnd;
        const matchSearch = filters.search === '' ||
            c.content.includes(filters.search) ||
            c.reporter.includes(filters.search) ||
            c.id.includes(filters.search);

        return matchStatus && matchRegion && matchManager && matchDateStart && matchDateEnd && matchSearch;
    });

    // Stats Data for Chart
    const statsData = {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        datasets: [
            {
                label: '월별 민원 접수',
                data: [12, 19, 3, 5, 2, 3, 15, 20, 10, 25, 10, 8],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
        ],
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-100 p-4 gap-4 overflow-hidden">

            {/* Left Column: Complaint Registration Form (Operator) */}
            <div className="w-[400px] flex-shrink-0 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <Phone size={20} /> {formData.id ? '민원 수정' : '민원 접수'}
                        </h2>
                        <p className="text-xs text-blue-600 mt-1">
                            {formData.id ? '기존 민원 정보를 수정합니다.' : '전화 민원 수신 시 실시간 입력 폼'}
                        </p>
                    </div>
                    {formData.id && (
                        <button
                            onClick={resetForm}
                            className="text-xs bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 font-bold"
                        >
                            신규 등록
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        {/* Reporter Section */}
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><User size={12} /> 신고자 정보</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <input
                                    type="text"
                                    placeholder="신고자 성명"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.reporter}
                                    onChange={e => setFormData({ ...formData, reporter: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="연락처 (010-0000-0000)"
                                    className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Complaint Details */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">민원 유형</label>
                            <select
                                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="ODOR">악취 발생</option>
                                <option value="NOISE">소음 피해</option>
                                <option value="LEAK">역류/누수</option>
                                <option value="ETC">기타 문의</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">접수 일시</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    className="flex-1 w-full min-w-0 border p-2 rounded text-sm outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                                <input
                                    type="time"
                                    className="flex-shrink-0 w-28 border p-2 rounded text-sm outline-none"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">발생 위치</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="주소 검색 또는 지도 선택"
                                    readOnly
                                    className="flex-1 border p-2 rounded text-sm bg-gray-50 cursor-pointer"
                                    value={formData.location}
                                    onClick={() => setIsPickerOpen(true)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPickerOpen(true)}
                                    className="bg-gray-200 p-2 rounded hover:bg-gray-300 text-gray-600"
                                >
                                    <MapPin size={20} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">민원 내용</label>
                            <textarea
                                rows={5}
                                className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 resize-none"
                                placeholder="민원 상세 내용을 입력하세요."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">첨부 파일 (현장 사진 등)</label>
                            {formData.id ? (
                                <div className="bg-gray-50 border rounded p-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                                        <Paperclip size={16} />
                                        <span>첨부된 파일 목록 ({Math.floor(Math.random() * 3) + 1}개)</span>
                                    </div>
                                    <ul className="space-y-1">
                                        <li className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                                            - 현장_사진_01.jpg (2.4MB)
                                        </li>
                                        <li className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                                            - 민원_상세_내용.pdf (1.1MB)
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow flex items-center gap-2 w-full justify-center transition-colors"
                            >
                                <Save size={18} /> 민원 등록 (저장)
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Dashboard (Tabs) */}
            <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('LIST')}
                        className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'LIST' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <List size={18} /> 민원 처리 현황 목록
                    </button>
                    <button
                        onClick={() => setActiveTab('STATS')}
                        className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'STATS' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <BarChart2 size={18} /> 통계 및 시각화
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50 p-6 overflow-hidden">
                    {activeTab === 'LIST' ? (
                        <div className="flex flex-col h-full gap-4">
                            {/* Filter Bar */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2 items-center justify-between">
                                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Search size={16} /> 민원 검색 필터
                                    </h4>
                                    <div className="text-sm text-gray-500">
                                        총 <span className="font-bold text-blue-600">{filteredComplaints.length}</span> 건
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {/* Date Range */}
                                    <div className="col-span-2 flex gap-1 items-center bg-gray-50 p-1 rounded border">
                                        <span className="text-xs text-gray-500 px-1">기간</span>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-xs outline-none"
                                            value={filters.dateStart}
                                            onChange={e => setFilters({ ...filters, dateStart: e.target.value })}
                                        />
                                        <span className="text-gray-400">~</span>
                                        <input
                                            type="date"
                                            className="w-full bg-transparent text-xs outline-none"
                                            value={filters.dateEnd}
                                            onChange={e => setFilters({ ...filters, dateEnd: e.target.value })}
                                        />
                                    </div>

                                    {/* Status */}
                                    <select
                                        className="col-span-1 border rounded px-2 py-1.5 text-sm bg-gray-50 outline-none focus:border-blue-500"
                                        value={filters.status}
                                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="ALL">전체 상태</option>
                                        <option value="RECEIVED">접수</option>
                                        <option value="IN_PROGRESS">처리중</option>
                                        <option value="COMPLETED">완료</option>
                                    </select>

                                    {/* Region */}
                                    <input
                                        type="text"
                                        placeholder="지역 (동)"
                                        className="col-span-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                        value={filters.region}
                                        onChange={e => setFilters({ ...filters, region: e.target.value })}
                                    />

                                    {/* Manager */}
                                    <input
                                        type="text"
                                        placeholder="담당자"
                                        className="col-span-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                        value={filters.manager}
                                        onChange={e => setFilters({ ...filters, manager: e.target.value })}
                                    />

                                    {/* Search Content */}
                                    <input
                                        type="text"
                                        placeholder="내용/신고자 검색"
                                        className="col-span-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                                        value={filters.search}
                                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 whitespace-nowrap">접수번호</th>
                                                <th className="px-4 py-3 whitespace-nowrap">접수일시</th>
                                                <th className="px-4 py-3 whitespace-nowrap">유형</th>
                                                <th className="px-4 py-3">위치</th>
                                                <th className="px-4 py-3">민원내용</th>
                                                <th className="px-4 py-3 whitespace-nowrap">접수자</th>
                                                <th className="px-4 py-3 whitespace-nowrap">담당자</th>
                                                <th className="px-4 py-3 whitespace-nowrap">상태</th>
                                                <th className="px-4 py-3 whitespace-nowrap">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredComplaints.map(complaint => (
                                                <tr key={complaint.id} className="hover:bg-blue-50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-gray-500">{complaint.id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-gray-900">{complaint.date}</div>
                                                        <div className="text-xs text-gray-500">{complaint.time}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${complaint.type === 'ODOR' ? 'bg-purple-100 text-purple-700' :
                                                            complaint.type === 'NOISE' ? 'bg-orange-100 text-orange-700' :
                                                                complaint.type === 'LEAK' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {complaint.type === 'ODOR' ? '악취' :
                                                                complaint.type === 'NOISE' ? '소음' :
                                                                    complaint.type === 'LEAK' ? '역류' : '기타'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800">{complaint.location}</td>
                                                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={complaint.content}>
                                                        {complaint.content}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800">{complaint.reporter}</td>
                                                    <td className="px-4 py-3 text-gray-800">{complaint.manager}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${complaint.status === 'RECEIVED' ? 'bg-yellow-100 text-yellow-800' :
                                                            complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                                complaint.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                            }`}>
                                                            {complaint.status === 'RECEIVED' && <AlertCircle size={10} />}
                                                            {complaint.status === 'IN_PROGRESS' && <Clock size={10} />}
                                                            {complaint.status === 'COMPLETED' && <CheckCircle size={10} />}
                                                            {complaint.status === 'RECEIVED' ? '접수' :
                                                                complaint.status === 'IN_PROGRESS' ? '처리중' :
                                                                    complaint.status === 'COMPLETED' ? '완료' : '반려'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleManageClick(complaint)}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="관리 (정보 로드)"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full gap-6 overflow-y-auto">
                            {/* Monthly Graph */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart2 size={20} className="text-blue-600" /> 월별 민원 발생 추이
                                </h3>
                                <div className="h-64">
                                    <Bar options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' as const },
                                        },
                                    }} data={statsData} />
                                </div>
                            </div>

                            {/* Map Visualization */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1 min-h-[400px] flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <MapPin size={20} className="text-red-500" /> 민원 발생 지역 분포
                                    </h3>
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setMapMode('MARKER')}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mapMode === 'MARKER'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            일반 지도
                                        </button>
                                        <button
                                            onClick={() => setMapMode('HEATMAP')}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mapMode === 'HEATMAP'
                                                ? 'bg-white text-red-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            히트맵
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200">
                                    <div ref={mapElement} className="absolute inset-0 w-full h-full" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LocationPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelect={handleLocationSelect}
            />
        </div>
    );
};

export default ComplaintForm;
