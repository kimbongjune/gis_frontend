import React, { useState } from 'react';
import { User, Shield, Lock, Activity, Save } from 'lucide-react';

const SystemManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'USERS' | 'LOGS' | 'CONFIG'>('USERS');

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Admin Tabs */}
            <div className="flex bg-slate-800 text-gray-400 rounded-lg p-1 w-fit">
                <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-slate-600 text-white' : 'hover:text-white'}`}><User size={16} /> 사용자 관리</button>
                <button onClick={() => setActiveTab('LOGS')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'LOGS' ? 'bg-slate-600 text-white' : 'hover:text-white'}`}><Activity size={16} /> 감사 로그</button>
                <button onClick={() => setActiveTab('CONFIG')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'CONFIG' ? 'bg-slate-600 text-white' : 'hover:text-white'}`}><Shield size={16} /> 보안 설정</button>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 p-6">
                {activeTab === 'USERS' && (
                    <div>
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-800">사용자 계정 목록</h3>
                            <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold">계정 생성</button>
                        </div>
                        <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">이름</th>
                                    <th className="p-3">부서</th>
                                    <th className="p-3">권한그룹</th>
                                    <th className="p-3">상태</th>
                                    <th className="p-3">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3">admin</td>
                                    <td className="p-3">관리자</td>
                                    <td className="p-3">환경과</td>
                                    <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">SUPER_ADMIN</span></td>
                                    <td className="p-3 text-green-600">정상</td>
                                    <td className="p-3"><button className="text-gray-500 hover:text-blue-600"><SettingsIcon /></button></td>
                                </tr>
                                <tr>
                                    <td className="p-3">operator1</td>
                                    <td className="p-3">김운영</td>
                                    <td className="p-3">시설관리팀</td>
                                    <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">OPERATOR</span></td>
                                    <td className="p-3 text-green-600">정상</td>
                                    <td className="p-3"><button className="text-gray-500 hover:text-blue-600"><SettingsIcon /></button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'LOGS' && (
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 mb-4">시스템 감사 로그</h3>
                        <div className="border rounded bg-gray-50 p-2 h-96 overflow-y-auto font-mono text-xs">
                            <div className="mb-1 text-gray-600">[2026-01-29 19:50:01] [LOGIN] user='admin' ip='192.168.0.1' status='SUCCESS'</div>
                            <div className="mb-1 text-gray-600">[2026-01-29 19:48:22] [CONTROL] user='operator1' target='FAC-001' command='START' result='OK'</div>
                            <div className="mb-1 text-red-600">[2026-01-29 19:45:10] [AUTH] user='unknown' ip='10.0.0.55' status='FAIL' reason='Invalid Password'</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Icon
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

export default SystemManagement;
