import React, { useState } from 'react';
import { Settings, DollarSign, FileText, AlertCircle, Upload } from 'lucide-react';

const AssetInventory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'LIST' | 'PLAN' | 'BUDGET'>('LIST');

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Tabs */}
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('LIST')}
                    className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${activeTab === 'LIST' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Settings size={16} /> 장비 자산 목록
                </button>
                <div className="w-px bg-gray-200 my-1"></div>
                <button
                    onClick={() => setActiveTab('PLAN')}
                    className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${activeTab === 'PLAN' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <AlertCircle size={16} /> 교체/수명 계획
                </button>
                <div className="w-px bg-gray-200 my-1"></div>
                <button
                    onClick={() => setActiveTab('BUDGET')}
                    className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-2 ${activeTab === 'BUDGET' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <DollarSign size={16} /> 예산 관리
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
                {activeTab === 'LIST' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">시설별 주요 장비 현황</h3>
                            <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2"><Upload size={14} /> 엑셀 일괄 등록</button>
                        </div>
                        <table className="w-full text-sm text-left border overflow-hidden rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">관리번호</th>
                                    <th className="p-3">장비명</th>
                                    <th className="p-3">규격/모델</th>
                                    <th className="p-3">제조사</th>
                                    <th className="p-3">취득일자</th>
                                    <th className="p-3">상태</th>
                                    <th className="p-3">관련문서</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="p-3">EQ-23-001</td>
                                    <td className="p-3 font-medium">송풍기 #1</td>
                                    <td className="p-3">TURBO-2000</td>
                                    <td className="p-3">바람테크</td>
                                    <td className="p-3">2023-01-20</td>
                                    <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">운용중</span></td>
                                    <td className="p-3 text-blue-600 underline cursor-pointer flex gap-1 items-center"><FileText size={14} /> 매뉴얼.pdf</td>
                                </tr>
                                <tr>
                                    <td className="p-3">EQ-23-002</td>
                                    <td className="p-3 font-medium">순환펌프 A</td>
                                    <td className="p-3">PUMP-XS</td>
                                    <td className="p-3">물나라</td>
                                    <td className="p-3">2023-01-20</td>
                                    <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">운용중</span></td>
                                    <td className="p-3 text-blue-600 underline cursor-pointer flex gap-1 items-center"><FileText size={14} /> 도면.dwg</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'PLAN' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800">장비 내구연한 및 교체 예정</h3>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        2026년 교체 예정인 장비가 <span className="font-bold">2대</span> 있습니다. 예산 편성이 필요합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <table className="w-full text-sm text-left border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">장비명</th>
                                    <th className="p-3">설치일</th>
                                    <th className="p-3">내구연한</th>
                                    <th className="p-3">잔존수명</th>
                                    <th className="p-3">교체예정일</th>
                                    <th className="p-3">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3">활성탄 흡착타워</td>
                                    <td className="p-3">2021-05-10</td>
                                    <td className="p-3">5년</td>
                                    <td className="p-3 text-red-600 font-bold">1년 미만</td>
                                    <td className="p-3">2026-05-10</td>
                                    <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">도래임박</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'BUDGET' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800">유지보수 예산 현황</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 border rounded bg-gray-50">
                                <div className="text-gray-500 text-xs mb-1">총 예산액 (2026)</div>
                                <div className="text-xl font-bold">150,000,000 원</div>
                            </div>
                            <div className="p-4 border rounded bg-white">
                                <div className="text-gray-500 text-xs mb-1">집행액</div>
                                <div className="text-xl font-bold text-blue-600">45,000,000 원</div>
                            </div>
                            <div className="p-4 border rounded bg-white">
                                <div className="text-gray-500 text-xs mb-1">잔액</div>
                                <div className="text-xl font-bold text-green-600">105,000,000 원</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetInventory;
