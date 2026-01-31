import React, { useState, useEffect } from 'react';
import {
    User, Shield, Activity, Search, Plus,
    MoreVertical, Check, X, FileText, Download,
    Briefcase, Calendar, Lock, Settings, Save, Edit, Trash2
} from 'lucide-react';

const SystemManagement: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'USERS' | 'PERMISSIONS' | 'LOGS'>('USERS');

    // --- USER MANAGEMENT STATE ---
    const [userSearch, setUserSearch] = useState('');
    const [users, setUsers] = useState([
        { id: 'admin', name: '시스템관리자', dept: '환경과', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2026-01-29 14:20:00' },
        { id: 'operator1', name: '김운영', dept: '시설관리팀', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '2026-01-29 09:00:00' },
        { id: 'viewer1', name: '이조회', dept: '대외협력팀', role: 'VIEWER', status: 'ACTIVE', lastLogin: '2026-01-28 17:30:00' },
        { id: 'guest', name: '홍길동', dept: '민원과', role: 'GUEST', status: 'INACTIVE', lastLogin: '2025-12-20 10:00:00' },
        { id: 'tech1', name: '박기술', dept: '기술지원팀', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '2026-01-29 11:15:00' },
    ]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newUser, setNewUser] = useState({ id: '', name: '', dept: '', role: 'OPERATOR' });

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setNewUser({ id: '', name: '', dept: '', role: 'OPERATOR' });
        setIsUserModalOpen(true);
    };

    const handleOpenEditModal = (user: typeof newUser) => {
        setIsEditing(true);
        setNewUser({ ...user });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = () => {
        if (isEditing) {
            setUsers(users.map(u => u.id === newUser.id ? { ...u, ...newUser } : u));
        } else {
            setUsers([...users, { ...newUser, status: 'ACTIVE', lastLogin: '-' }]);
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    // --- PERMISSION STATE ---
    const [selectedRole, setSelectedRole] = useState('OPERATOR');
    const roles = [
        { id: 'SUPER_ADMIN', name: '최고 관리자', desc: '모든 시스템 접근 및 설정 권한' },
        { id: 'OPERATOR', name: '운영자', desc: '시설 제어 및 운영 데이터 관리' },
        { id: 'VIEWER', name: '조회 사용자', desc: '모니터링 및 이력 조회만 가능' },
        { id: 'GUEST', name: '게스트', desc: '제한된 공개 데이터만 접근' },
    ];

    // Initial permission template
    const initialPermissions = [
        { id: 'DASHBOARD', name: '대시보드', read: true, write: false },
        { id: 'GIS_CONTROL', name: 'GIS 관제', read: false, write: false },
        { id: 'HISTORY', name: '운영 이력', read: false, write: false },
        { id: 'MAINTENANCE', name: '정비 업무', read: false, write: false },
        { id: 'STATS', name: '통계 분석', read: false, write: false },
        { id: 'SYSTEM', name: '시스템 관리', read: false, write: false },
    ];

    // State to store permissions FOR EACH ROLE
    const [rolePermissions, setRolePermissions] = useState<Record<string, typeof initialPermissions>>({
        'SUPER_ADMIN': initialPermissions.map(p => ({ ...p, read: true, write: true })),
        'OPERATOR': initialPermissions.map(p => ({ ...p, read: true, write: ['GIS_CONTROL', 'MAINTENANCE'].includes(p.id) })),
        'VIEWER': initialPermissions.map(p => ({ ...p, read: true, write: false })),
        'GUEST': initialPermissions.map(p => ({ ...p, read: ['DASHBOARD'].includes(p.id), write: false })),
    });

    // Helper to toggle permission
    const handlePermissionChange = (roleId: string, permId: string, type: 'read' | 'write') => {
        setRolePermissions(prev => ({
            ...prev,
            [roleId]: prev[roleId].map(p =>
                p.id === permId ? { ...p, [type]: !p[type] } : p
            )
        }));
    };

    const handleSavePermissions = () => {
        alert('권한 설정이 저장되었습니다.');
    };

    // --- LOGS STATE ---
    const [logType, setLogType] = useState('');
    const [logs] = useState(Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        time: `2026-01-29 1${Math.floor(i / 2)}:${(i * 3) % 60 < 10 ? '0' : ''}${(i * 3) % 60}:00`,
        type: i % 3 === 0 ? 'LOGIN' : (i % 3 === 1 ? 'API' : 'CHANGE'),
        user: i % 4 === 0 ? 'admin' : (i % 4 === 1 ? 'operator1' : 'system'),
        ip: `192.168.0.${100 + i}`,
        target: i % 3 === 1 ? '/api/facility/status' : (i % 3 === 2 ? 'User Config' : 'Auth System'),
        result: i % 10 === 0 ? 'FAIL' : 'SUCCESS',
        msg: i % 10 === 0 ? 'Invalid Credentials' : 'Operation Completed'
    })));


    return (
        <div className="flex flex-col h-full bg-slate-50 gap-4 p-4 pb-8 overflow-hidden relative">

            {/* Header / Tabs */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('USERS')}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${activeTab === 'USERS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <User size={18} /> 사용자 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('PERMISSIONS')}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${activeTab === 'PERMISSIONS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <Shield size={18} /> 권한 설정
                    </button>
                    <button
                        onClick={() => setActiveTab('LOGS')}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${activeTab === 'LOGS'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <Activity size={18} /> 시스템 로그
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col">

                {/* --- USERS TAB --- */}
                {activeTab === 'USERS' && (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex gap-3 items-center">
                                <h3 className="font-bold text-slate-800 text-lg">사용자 목록</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="이름, ID 검색"
                                        className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                </div>
                            </div>
                            <button
                                onClick={handleOpenAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
                            >
                                <Plus size={16} /> 사용자 등록
                            </button>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <div className="p-4">
                                <table className="w-full text-sm text-center border-collapse">
                                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs shadow-sm">
                                        <tr>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">User ID</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">이름</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">부서</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">권한등급</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">상태</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">마지막 접속</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.filter(u => u.id.includes(userSearch) || u.name.includes(userSearch)).map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 font-mono text-slate-600">{u.id}</td>
                                                <td className="p-3 font-bold text-slate-800">{u.name}</td>
                                                <td className="p-3 text-slate-600">{u.dept}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                        u.role === 'OPERATOR' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`flex items-center justify-center gap-1.5 text-xs font-bold ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-500 text-xs">{u.lastLogin}</td>
                                                <td className="p-3 flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditModal(u)}
                                                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PERMISSIONS TAB --- */}
                {activeTab === 'PERMISSIONS' && (
                    <div className="flex h-full animate-in fade-in zoom-in-95 duration-200">
                        {/* Roles List (Left) */}
                        <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
                            <div className="p-4 border-b border-slate-200 font-bold text-slate-700">권한 그룹</div>
                            <div className="flex-1 overflow-auto p-2 space-y-1">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${selectedRole === role.id
                                            ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500 z-10'
                                            : 'border-transparent hover:bg-slate-200/50 text-slate-600'
                                            }`}
                                    >
                                        <div className={`font-bold ${selectedRole === role.id ? 'text-blue-700' : 'text-slate-700'}`}>{role.name}</div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{role.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Permission Matrix (Right) */}
                        <div className="flex-1 flex flex-col bg-white">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{roles.find(r => r.id === selectedRole)?.name} 권한 설정</h3>
                                    <p className="text-xs text-slate-500 mt-1">해당 역할이 접근 가능한 메뉴와 기능을 설정합니다.</p>
                                </div>
                                <button
                                    onClick={handleSavePermissions}
                                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-sm"
                                >
                                    <Save size={16} /> 변경사항 저장
                                </button>
                            </div>

                            <div className="p-6 overflow-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rolePermissions[selectedRole]?.map(perm => (
                                        <div key={perm.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                                        {perm.id === 'GIS_CONTROL' ? <Briefcase size={16} /> : <FileText size={16} />}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{perm.name}</span>
                                                </div>
                                                <div className="text-xs font-mono text-slate-400">{perm.id}</div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group">
                                                    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900">조회 (Read)</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.read}
                                                        onChange={() => handlePermissionChange(selectedRole, perm.id, 'read')}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                                <label className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group">
                                                    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900">수정/삭제 (Write)</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={perm.write}
                                                        onChange={() => handlePermissionChange(selectedRole, perm.id, 'write')}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LOGS TAB --- */}
                {activeTab === 'LOGS' && (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                        {/* Log Filters */}
                        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-end bg-slate-50/50">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">로그 유형</label>
                                <select
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value)}
                                    className="border border-slate-300 rounded-md px-3 py-2 text-sm w-36 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 bg-white"
                                >
                                    <option value="">전체</option>
                                    <option value="LOGIN">접속 기록</option>
                                    <option value="API">API 호출</option>
                                    <option value="CHANGE">정보 변경</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">조회 기간</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white" />
                                    <span className="text-slate-400 font-bold">~</span>
                                    <input type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white" />
                                </div>
                            </div>
                            <div className="flex-1"></div>
                            <div className="flex gap-2">
                                <button className="border border-slate-200 bg-white px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                                    <FileText size={14} className="text-red-500" /> PDF
                                </button>
                                <button className="border border-slate-200 bg-white px-3 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
                                    <Download size={14} className="text-green-600" /> Excel
                                </button>
                            </div>
                        </div>

                        {/* Log Table */}
                        <div className="flex-1 overflow-auto">
                            <div className="p-4">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs shadow-sm">
                                        <tr>
                                            <th className="p-3 border-b border-slate-200 font-bold w-40 bg-slate-100 sticky top-0 z-50">발생 일시</th>
                                            <th className="p-3 border-b border-slate-200 font-bold w-24 text-center bg-slate-100 sticky top-0 z-50">유형</th>
                                            <th className="p-3 border-b border-slate-200 font-bold w-32 bg-slate-100 sticky top-0 z-50">User ID</th>
                                            <th className="p-3 border-b border-slate-200 font-bold w-32 bg-slate-100 sticky top-0 z-50">IP Address</th>
                                            <th className="p-3 border-b border-slate-200 font-bold bg-slate-100 sticky top-0 z-50">대상 / 상세</th>
                                            <th className="p-3 border-b border-slate-200 font-bold w-24 text-center bg-slate-100 sticky top-0 z-50">결과</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                                        {logs.map(l => (
                                            <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 text-slate-500">{l.time}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded border ${l.type === 'LOGIN' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        l.type === 'CHANGE' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {l.type}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-semibold text-slate-700">{l.user}</td>
                                                <td className="p-3 text-slate-500">{l.ip}</td>
                                                <td className="p-3 text-slate-600">
                                                    <span className="font-bold text-slate-800 mr-2">[{l.target}]</span>
                                                    {l.msg}
                                                </td>
                                                <td className={`p-3 font-bold text-center ${l.result === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {l.result}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Registration/Edit Modal */}
            {isUserModalOpen && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{isEditing ? '사용자 정보 수정' : '사용자 등록'}</h3>
                            <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-600">아이디 (ID)</label>
                                <input
                                    type="text"
                                    disabled={isEditing}
                                    className={`w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                    placeholder="사용자 ID 입력"
                                    value={newUser.id}
                                    onChange={e => setNewUser({ ...newUser, id: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-600">이름</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="사용자 이름 입력"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-600">부서</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="소속 부서 입력"
                                    value={newUser.dept}
                                    onChange={e => setNewUser({ ...newUser, dept: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-600">권한 그룹</label>
                                <select
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md text-sm font-bold hover:bg-white"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 shadow-sm"
                            >
                                {isEditing ? '수정 저장' : '등록하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemManagement;
