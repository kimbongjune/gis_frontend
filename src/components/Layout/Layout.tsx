import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, X, Home, Settings, AlertTriangle, Activity,
    BarChart2, Bell, Layers, Database, List as ListIcon,
    Archive, Calendar, Clock, Smartphone, LogOut, CheckCircle
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getBreadcrumb = () => {
        const path = location.pathname;
        const map: Record<string, string> = {
            '/': '홈 > 대시보드',
            '/pipe-info': '홈 > 관제 > 하수관로 정보',
            '/monitoring': '홈 > 관제 > 실시간 모니터링',
            '/monitoring/mobile': '홈 > 관제 > 모바일 현황판', // Updated
            '/facilities/measurement': '홈 > 시설관리 > 측정시설 관리',
            '/facilities/list': '홈 > 시설관리 > 저감시설 목록',
            '/facilities/control': '홈 > 시설관리 > 저감시설 제어',
            '/asset': '홈 > 시설관리 > 자산 관리',
            '/maintenance': '홈 > 운영지원 > 유지관리 업무',
            '/history': '홈 > 운영지원 > 운영 이력',
            '/complaints': '홈 > 민원관리 > 민원 접수/처리',
            '/admin/system': '홈 > 시스템 > 시스템 관리',
        };
        return map[path] || '홈';
    };

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            navigate('/login');
        }
    };

    const navItems = [
        {
            category: '통합 관제', items: [
                { name: '대시보드', path: '/', icon: <Home size={18} /> },
                { name: '하수관로 정보', path: '/pipe-info', icon: <Layers size={18} /> },
                { name: '실시간 모니터링', path: '/monitoring', icon: <Activity size={18} /> },
                { name: '모바일 현황판', path: '/monitoring/mobile', icon: <Smartphone size={18} /> }, // Moved here
            ]
        },
        {
            category: '시설 관리', items: [
                { name: '측정시설 관리', path: '/facilities/measurement', icon: <Database size={18} /> },
                { name: '저감시설 목록', path: '/facilities/list', icon: <ListIcon size={18} /> },
                { name: '저감시설 제어', path: '/facilities/control', icon: <Settings size={18} /> },
                { name: '자산 인벤토리', path: '/asset', icon: <Archive size={18} /> },
            ]
        },
        {
            category: '운영 지원', items: [
                { name: '민원 접수/처리', path: '/complaints', icon: <AlertTriangle size={18} /> },
                { name: '유지관리 업무', path: '/maintenance', icon: <Calendar size={18} /> },
                { name: '운영 이력 조회', path: '/history', icon: <Clock size={18} /> },
            ]
        },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            {/* Sidebar (LNB) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col shadow-xl border-r border-slate-800`}
            >
                <div className="flex items-center justify-between h-16 shrink-0 px-4 bg-slate-950 border-b border-slate-800">
                    <Link to="/" className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight">광주 남구<br /><span className="text-blue-400 text-sm font-normal">스마트 하수악취 관리</span></h1>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {navItems.map((group, idx) => (
                        <div key={idx}>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">{group.category}</div>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-200 ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-md translate-x-1' : 'text-gray-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-slate-800">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">테스트</div>
                        <Link to="/test/map" className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${location.pathname === '/test/map' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                            <Layers size={18} /> 지도 연동 테스트
                        </Link>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">시스템</div>
                        <Link to="/admin/system" className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${location.pathname === '/admin/system' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
                            <Settings size={18} /> 시스템 관리
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">OP</div>
                        <div>
                            <div className="text-sm font-medium">관리자(Admin)</div>
                            <div className="text-xs text-gray-400">시스템 운영팀</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header (GNB) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30 w-full relative">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-500 hover:text-gray-900">
                            <Menu size={24} />
                        </button>
                        <div className="text-sm text-gray-500 lg:hidden">광주 남구 스마트 하수악취 관리</div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <Bell size={20} className="text-gray-600 hover:text-blue-600" />
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                                        <span className="font-bold text-sm text-gray-800">알림 (3)</span>
                                        <button onClick={() => setShowNotifications(false)}><X size={14} className="text-gray-400 hover:text-gray-600" /></button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">봉선시장 센서 경보</div>
                                                    <div className="text-xs text-gray-500">복합악취 수치가 임계치를 초과했습니다.</div>
                                                    <div className="text-xs text-gray-400 mt-1">10분 전</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors">
                                            <div className="flex items-start gap-2">
                                                <Activity size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">백운광장 저감장치 가동</div>
                                                    <div className="text-xs text-gray-500">자동 제어 모드에 의해 가동이 시작되었습니다.</div>
                                                    <div className="text-xs text-gray-400 mt-1">25분 전</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 hover:bg-blue-50 cursor-pointer transition-colors">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold text-gray-800">민원 처리 완료</div>
                                                    <div className="text-xs text-gray-500">접수번호 #2026-003의 처리가 완료되었습니다.</div>
                                                    <div className="text-xs text-gray-400 mt-1">1시간 전</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-4 w-px bg-gray-300"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
                        >
                            <LogOut size={16} /> 로그아웃
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 overflow-hidden bg-gray-100 p-6 flex flex-col">
                    {/* Breadcrumb */}
                    <div className="mb-4 text-sm text-gray-500 font-medium shrink-0">
                        {getBreadcrumb()}
                    </div>

                    <div className="p-2 flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden glass-blur"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
