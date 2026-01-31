import React, { useState } from 'react';
import { Download, Search, FileText, List, BarChart2 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const OperationHistory: React.FC = () => {
    // Filter State
    const [selectedType, setSelectedType] = useState('');
    const [searchId, setSearchId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Tab State
    const [activeTab, setActiveTab] = useState<'list' | 'chart'>('list');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // Increased to 15 for better density

    // Mock History Data
    const allHistory = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        facilityId: `FAC-${1000 + i}`,
        time: `2026-01-29 10:${(10 + i) % 60 < 10 ? '0' : ''}${(10 + i) % 60}:00`,
        facility: i % 2 === 0 ? '백운광장 저감장치' : '봉선시장 저감장치',
        type: i % 2 === 0 ? 'reduction' : 'measurement',
        mode: i % 3 === 0 ? '자동' : '수동',
        status: i % 10 === 0 ? '이상' : '정상',
        duration: '45분',
        power: (Math.random() * 5 + 10).toFixed(1)
    }));

    const [filteredHistory, setFilteredHistory] = useState(allHistory);

    // Filter Logic
    const handleSearch = () => {
        const filtered = allHistory.filter(item => {
            const matchType = selectedType === '' || item.type === selectedType;
            const matchId = searchId === '' || item.facilityId.toLowerCase().includes(searchId.toLowerCase());

            let matchDate = true;
            if (startDate && endDate) {
                const itemDate = item.time.substring(0, 10);
                matchDate = itemDate >= startDate && itemDate <= endDate;
            }

            return matchType && matchId && matchDate;
        });
        setFilteredHistory(filtered);
        setCurrentPage(1);
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { font: { size: 14 } }
            },
            title: {
                display: true,
                text: '일별 에너지 사용량 요약',
                font: { size: 18, weight: 'bold' as const }
            },
        },
        scales: {
            y: { ticks: { font: { size: 12 } } },
            x: { ticks: { font: { size: 12 } } }
        }
    };

    const chartData = {
        labels: ['Jan 22', 'Jan 23', 'Jan 24', 'Jan 25', 'Jan 26', 'Jan 27', 'Jan 28'],
        datasets: [
            {
                label: '에너지 사용량 (kWh)',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return (
        <div className="flex flex-col h-[calc(100vh-170px)] bg-slate-50 gap-4 p-4 pb-8 overflow-hidden">
            {/* Search Filter Panel - Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 shrink-0">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">시설 구분</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-slate-50 hover:bg-white"
                        >
                            <option value="">전체 보기</option>
                            <option value="reduction">저감시설</option>
                            <option value="measurement">측정시설</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">시설 ID</label>
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="ID 검색"
                            className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-slate-50 focus:bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">조회 기간</label>
                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-slate-50 hover:bg-white"
                            />
                            <span className="text-slate-400 font-bold mx-1">~</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-slate-50 hover:bg-white"
                            />
                        </div>
                    </div>
                    <div className="flex-1"></div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                        <Search size={16} /> 조회
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 shrink-0 border-b border-slate-200 pb-px px-1">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'list'
                            ? 'bg-white border-x border-t border-slate-200 text-blue-600 relative top-px shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
                            : 'bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                >
                    <List size={18} /> 운영 이력 목록
                </button>
                <button
                    onClick={() => setActiveTab('chart')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all flex items-center gap-2 ${activeTab === 'chart'
                            ? 'bg-white border-x border-t border-slate-200 text-blue-600 relative top-px shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
                            : 'bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                >
                    <BarChart2 size={18} /> 에너지 사용량 차트
                </button>
            </div>

            {/* Content Area: Tabbed Content */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-b-lg rounded-tr-lg border border-slate-200 shadow-sm relative -top-px overflow-hidden">

                {/* LIST TAB */}
                {activeTab === 'list' && (
                    <div className="flex-1 flex flex-col overflow-hidden p-4 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-3 shrink-0">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <FileText size={20} className="text-slate-500" />
                                검색 결과
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full ml-2">Total {filteredHistory.length}</span>
                            </h3>
                            <div className="flex gap-2">
                                <button className="border border-slate-200 bg-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                                    <FileText size={14} className="text-red-500" /> PDF 다운로드
                                </button>
                                <button className="border border-slate-200 bg-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                                    <Download size={14} className="text-green-600" /> Excel 다운로드
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-center border-collapse">
                                <thead className="bg-slate-50 text-slate-600 uppercase text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">일시</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">시설 ID</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">시설명</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">운전모드</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">상태</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">가동시간</th>
                                        <th className="p-3 border-b border-slate-200 font-bold tracking-wider">전력사용량</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {currentItems.length > 0 ? (
                                        currentItems.map(h => (
                                            <tr key={h.id} className="hover:bg-blue-50/50 transition-colors group">
                                                <td className="p-3 text-slate-600 whitespace-nowrap font-medium">{h.time}</td>
                                                <td className="p-3 text-slate-800 font-mono font-medium bg-slate-50/50 rounded group-hover:bg-blue-100/30 transition-colors">{h.facilityId}</td>
                                                <td className="p-3 font-bold text-slate-800">{h.facility}</td>
                                                <td className="p-3 text-slate-600">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${h.mode === '자동' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                        {h.mode}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`font-bold text-xs px-2 py-1 rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto ${h.status === '정상' ? 'text-green-700 bg-green-100 border border-green-200' : 'text-red-700 bg-red-100 border border-red-200 animate-pulse'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${h.status === '정상' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-600 font-medium">{h.duration}</td>
                                                <td className="p-3 font-mono text-slate-900 font-bold">{h.power} <span className="text-xs font-normal text-slate-500">kWh</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                                                <Search size={48} className="opacity-20" />
                                                <span className="text-lg">일치하는 데이터가 없습니다.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-2 shrink-0 mt-4">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                            >
                                Prev
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* CHART TAB */}
                {activeTab === 'chart' && (
                    <div className="flex-1 p-6 flex flex-col animate-in fade-in duration-300">
                        <div className="flex-1 bg-white p-4">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OperationHistory;
