import React from 'react';
import { Search } from 'lucide-react';

interface PipeFilterProps {
    filters: {
        region: string;
        type: string;
        status: string;
        installYear: string;
        startDate: string;
        endDate: string;
    };
    onFilterChange: (name: string, value: string) => void;
}

const PipeFilter: React.FC<PipeFilterProps> = ({ filters, onFilterChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 shrink-0">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Search size={18} /> 관로 정보 검색
            </h3>
            <div className="space-y-4">
                {/* Region */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">관할 구역</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                        value={filters.region}
                        onChange={(e) => onFilterChange('region', e.target.value)}
                    >
                        <option value="ALL">전체</option>
                        <option value="Bongseon">봉선동</option>
                        <option value="Baekun">백운동</option>
                        <option value="Jinwol">진월동</option>
                        <option value="Yangrim">양림동</option>
                    </select>
                </div>

                {/* Pipe Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">관로 종류</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                    >
                        <option value="ALL">전체</option>
                        <option value="SEWAGE">오수관</option>
                        <option value="RAIN">우수관</option>
                        <option value="COMBINED">합류관</option>
                    </select>
                </div>

                {/* Time Range */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">기간 설정</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded p-1.5 text-xs"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange('startDate', e.target.value)}
                        />
                        <span className="text-gray-400 self-center">~</span>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded p-1.5 text-xs"
                            value={filters.endDate}
                            onChange={(e) => onFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </div>

                {/* Install Year */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">설치년도</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                        value={filters.installYear}
                        onChange={(e) => onFilterChange('installYear', e.target.value)}
                    >
                        <option value="ALL">전체</option>
                        <option value="2024">2024년</option>
                        <option value="2023">2023년</option>
                        <option value="2022">2022년</option>
                        <option value="2021">2021년</option>
                        <option value="OLD">2020년 이전</option>
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">상태 등급</label>
                    <select
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="ALL">전체</option>
                        <option value="NORMAL">정상 (A등급)</option>
                        <option value="WARNING">주의 (B,C등급)</option>
                        <option value="CRITICAL">위험 (D등급)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PipeFilter;
