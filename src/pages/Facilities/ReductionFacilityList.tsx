import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';

const ReductionFacilityList: React.FC = () => {
    // Mock Data for Facility Ledger
    const facilities = [
        { id: 'FAC-001', name: '백운광장 저감장치', type: '약액세정식', location: '백운동 123-4', capacity: '100CMM', installDate: '2023-01-15', company: '환경기술(주)', manager: '김철수' },
        { id: 'FAC-002', name: '봉선시장 저감장치', type: '활성탄흡착식', location: '봉선동 55', capacity: '50CMM', installDate: '2023-03-20', company: '맑은공기(주)', manager: '이영희' },
        { id: 'FAC-003', name: '효덕동 주민센터 앞', type: '바이오필터', location: '효덕동 99', capacity: '80CMM', installDate: '2022-11-05', company: '에코시스템', manager: '박준호' },
        { id: 'FAC-004', name: '진월동 공영주차장', type: '약액세정식', location: '진월동 12', capacity: '100CMM', installDate: '2023-06-10', company: '환경기술(주)', manager: '최민수' },
    ];

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">검색조건</span>
                    <select className="border rounded px-2 py-1.5 text-sm w-32">
                        <option>전체 지역</option>
                        <option>백운동</option>
                        <option>봉선동</option>
                    </select>
                    <select className="border rounded px-2 py-1.5 text-sm w-32">
                        <option>전체 유형</option>
                        <option>약액세정식</option>
                        <option>활성탄흡착식</option>
                    </select>
                    <div className="relative">
                        <input type="text" placeholder="시설명 검색" className="border rounded px-3 py-1.5 pl-8 text-sm w-64" />
                        <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                    <button className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-900">조회</button>
                </div>
                <div className="ml-auto">
                    <button className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
                        <Download size={14} /> 엑셀 다운로드
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 border-b text-center w-16">No</th>
                            <th className="p-3 border-b">시설명</th>
                            <th className="p-3 border-b">기술유형</th>
                            <th className="p-3 border-b">설치장소</th>
                            <th className="p-3 border-b">처리용량</th>
                            <th className="p-3 border-b">설치일자</th>
                            <th className="p-3 border-b">시공/유지관리 업체</th>
                            <th className="p-3 border-b">관리책임자</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {facilities.map((fac, idx) => (
                            <tr key={fac.id} className="hover:bg-blue-50 transition-colors cursor-pointer">
                                <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                                <td className="p-3 font-medium text-blue-600">{fac.name}</td>
                                <td className="p-3">{fac.type}</td>
                                <td className="p-3">{fac.location}</td>
                                <td className="p-3">{fac.capacity}</td>
                                <td className="p-3 text-gray-600 center">{fac.installDate}</td>
                                <td className="p-3">{fac.company}</td>
                                <td className="p-3">{fac.manager}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-gray-100 flex justify-center">
                <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50">{'<'}</button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded bg-blue-600 text-white border-blue-600">1</button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50">2</button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50">3</button>
                    <button className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50">{'>'}</button>
                </div>
            </div>
        </div>
    );
};

export default ReductionFacilityList;
