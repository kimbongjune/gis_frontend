import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';

const OperationHistory: React.FC = () => {
    // Mock History Data
    const history = Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        time: `2026-01-29 10:${10 + i}:00`,
        facility: i % 2 === 0 ? '백운광장 저감장치' : '봉선시장 저감장치',
        type: '자동',
        status: '가동',
        duration: '45분',
        power: `${(Math.random() * 5 + 10).toFixed(1)} kWh`
    }));

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700 text-sm">기간 설정</span>
                    <input type="date" className="border rounded px-2 py-1 text-sm" />
                    <span>~</span>
                    <input type="date" className="border rounded px-2 py-1 text-sm" />
                </div>
                <div className="flex items-center gap-2">
                    <select className="border rounded px-2 py-1 text-sm"><option>전체 시설</option></select>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Search size={14} /> 조회</button>
                </div>
                <div className="ml-auto">
                    <button className="border bg-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-50"><Download size={14} /> 엑셀</button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-sm text-center border-collapse">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 border-b">일시</th>
                            <th className="p-3 border-b">시설명</th>
                            <th className="p-3 border-b">운전모드</th>
                            <th className="p-3 border-b">상태</th>
                            <th className="p-3 border-b">가동시간</th>
                            <th className="p-3 border-b">전력사용량</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {history.map(h => (
                            <tr key={h.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-600">{h.time}</td>
                                <td className="p-3 font-medium">{h.facility}</td>
                                <td className="p-3">{h.type}</td>
                                <td className="p-3"><span className="text-green-600 font-bold">{h.status}</span></td>
                                <td className="p-3">{h.duration}</td>
                                <td className="p-3 font-mono">{h.power}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationHistory;
