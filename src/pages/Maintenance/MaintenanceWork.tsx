import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import {
    Plus, X, Calendar as CalIcon, User, Clock, CheckCircle,
    ChevronLeft, ChevronRight, Search, Filter, MoreHorizontal,
    FileText, List, AlertCircle
} from 'lucide-react';
import { DatesSetArg, EventDropArg } from '@fullcalendar/core';

// --- Interfaces ---
interface MaintenanceTask {
    id: string;
    title: string;
    start: string; // ISO String or YYYY-MM-DD
    end?: string;  // Exclusive end date for multi-day
    type: 'INSPECTION' | 'REPAIR' | 'REPLACE' | 'EMERGENCY';
    status: 'SCHEDULED' | 'COMPLETED';
    inCharge: string;
    description?: string;
    // New Fields
    facilityName?: string;
    checkItem?: string;
    isAllDay?: boolean;
    startTime?: string;
    endTime?: string;
    result?: 'GOOD' | 'BAD' | 'PENDING';
}

// --- Mock Data ---
const INITIAL_EVENTS: MaintenanceTask[] = [
    { id: '1', title: '백운광장 정기점검', start: new Date().toISOString().split('T')[0], type: 'INSPECTION', status: 'SCHEDULED', inCharge: '김철수', facilityName: '백운광장 펌프장', checkItem: '모터 진동 점검', isAllDay: true, result: 'PENDING' },
    { id: '4', title: '긴급 배관 보수', start: new Date(Date.now() + 86400000).toISOString().split('T')[0], type: 'EMERGENCY', status: 'SCHEDULED', inCharge: '최팀장', facilityName: '주월동 4가', checkItem: '배관 파손', isAllDay: true, result: 'PENDING' },
];

const MaintenanceWork: React.FC = () => {
    // --- State ---
    const [activeTab, setActiveTab] = useState<'CALENDAR' | 'HISTORY'>('CALENDAR');
    const [events, setEvents] = useState<MaintenanceTask[]>(INITIAL_EVENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentViewEvents, setCurrentViewEvents] = useState<MaintenanceTask[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });

    // Sync Sidebar with Events & View Range
    React.useEffect(() => {
        const visibleEvents = events.filter(e => {
            const eStart = new Date(e.start);
            const eEnd = e.end ? new Date(e.end) : new Date(e.start);
            // Check overlap with viewRange
            return eStart < viewRange.end && (e.end ? eEnd > viewRange.start : eStart >= viewRange.start);
        });
        setCurrentViewEvents(visibleEvents);
    }, [events, viewRange]);

    // UI Toggles
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);

    // Filter State
    const [filterTypes, setFilterTypes] = useState<string[]>(['INSPECTION', 'REPAIR', 'REPLACE', 'EMERGENCY']);

    // Filtered Events
    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.includes(searchTerm) ||
            e.inCharge.includes(searchTerm) ||
            (e.facilityName && e.facilityName.includes(searchTerm));
        const matchesType = filterTypes.includes(e.type);
        return matchesSearch && matchesType;
    });

    // Form State
    const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
        title: '', type: 'INSPECTION', inCharge: '', start: '', isAllDay: true
    });

    const calendarRef = useRef<FullCalendar>(null);

    // --- Helpers ---
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'INSPECTION': return '정기점검';
            case 'REPAIR': return '보수';
            case 'REPLACE': return '교체';
            case 'EMERGENCY': return '긴급';
            default: return '기타';
        }
    };

    // Stats for History Tab
    const getStats = () => {
        const completed = events.filter(e => e.status === 'COMPLETED').length;
        const total = events.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Mock Anomaly Rate based on 'BAD' result
        const anomalies = events.filter(e => e.result === 'BAD').length;
        const anomalyRate = total > 0 ? Math.round((anomalies / total) * 100) : 0;

        return { rate, anomalyRate };
    };

    // --- Handlers ---
    const handleDateClick = (arg: DateClickArg) => {
        setNewTask({ ...newTask, start: arg.dateStr, end: arg.dateStr, isAllDay: true });
        setIsModalOpen(true);
    };

    const handleDatesSet = (arg: DatesSetArg) => {
        // Update View Range State
        setViewRange({ start: arg.start, end: arg.end });

        // Update Title manually
        const titleEl = document.getElementById('calendar-title');
        if (titleEl) titleEl.innerText = arg.view.title;
    };

    const handleEventDrop = (arg: EventDropArg) => {
        const { event } = arg;
        const updatedEvents = events.map(e => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: event.startStr.split('T')[0], // Keep it YYYY-MM-DD if possible or full ISO if needed
                    end: event.endStr ? event.endStr.split('T')[0] : undefined,
                    isAllDay: event.allDay // Update allDay status from drop
                };
            }
            return e;
        });
        setEvents(updatedEvents);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 p-6 pb-20 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">유지보수 내역</h1>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="작업명, 담당자 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium text-sm shadow-sm transition-all ${isFilterOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700'}`}
                        >
                            <Filter size={16} />
                            필터
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
                                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">작업 유형</h4>
                                <div className="space-y-1">
                                    {['INSPECTION', 'REPAIR', 'REPLACE', 'EMERGENCY'].map(type => (
                                        <label key={type} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filterTypes.includes(type)}
                                                onChange={e => {
                                                    if (e.target.checked) setFilterTypes([...filterTypes, type]);
                                                    else setFilterTypes(filterTypes.filter(t => t !== type));
                                                }}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{getTypeLabel(type)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setNewTask({ title: '', type: 'INSPECTION', inCharge: '', start: new Date().toISOString().split('T')[0], isAllDay: true });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        작업 등록
                    </button>
                </div>
            </div>

            {/* Tabs - Separate Row */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('CALENDAR')}
                    className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'CALENDAR' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <CalIcon size={16} /> 점검 일정
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`px-6 py-3 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText size={16} /> 점검 이력
                </button>
            </div>

            {/* --- TAB CONTENT: CALENDAR --- */}
            {activeTab === 'CALENDAR' && (
                <div className="flex gap-6 items-start">

                    {/* Calendar Card */}
                    <div className="flex-1 flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Left: FullCalendar */}
                        <div className="flex-[3] flex flex-col border-r border-gray-200 min-w-0">

                            {/* Custom Toolbar */}
                            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <CalIcon className="text-blue-600" />
                                        {/* Valid only after mount, but title updates via datesSet */}
                                        <span id="calendar-title">2026년 2월</span>
                                    </h2>
                                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                        <button onClick={() => calendarRef.current?.getApi().prev()} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"><ChevronLeft size={18} /></button>
                                        <button onClick={() => calendarRef.current?.getApi().today()} className="px-3 text-xs font-bold hover:bg-white hover:shadow-sm rounded-md transition-all mx-1 text-gray-700">오늘</button>
                                        <button onClick={() => calendarRef.current?.getApi().next()} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"><ChevronRight size={18} /></button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                                        <button onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')} className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-700">월간</button>
                                        <button onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')} className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-700">주간</button>
                                        <button onClick={() => calendarRef.current?.getApi().changeView('timeGridDay')} className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-700">일간</button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <style>{`
                                .fc { font-family: 'Inter', sans-serif; }
                                .fc-theme-standard td, .fc-theme-standard th { border-color: #f3f4f6; }
                                .fc-col-header-cell { padding: 12px 0; background-color: #f9fafb; font-weight: 600; color: #4b5563; font-size: 0.9rem; }
                                .fc-daygrid-day-number { padding: 8px 12px; font-size: 0.95rem; font-weight: 500; color: #374151; }
                                .fc-daygrid-day-frame { min-height: 120px !important; }
                                .fc-event { border: none !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                                .fc-day-today { background-color: #fffbeb !important; }
                                .fc-highlight { background: #eff6ff !important; }
                                .fc-daygrid-event-dot { display: none; }
                                /* Restore Tooltip Styles */
                                .fc-popover { border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: none; z-index: 50; }

                                /* Weekend Colors */
                                .fc-day-sat .fc-col-header-cell-cushion,
                                .fc-day-sat .fc-daygrid-day-number { color: #3B82F6 !important; } /* Blue */

                                .fc-day-sun .fc-col-header-cell-cushion,
                                .fc-day-sun .fc-daygrid-day-number { color: #EF4444 !important; } /* Red */
                            `}</style>
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={false}
                                    locale="ko"
                                    events={filteredEvents}
                                    eventBackgroundColor="transparent"
                                    eventBorderColor="transparent"
                                    editable={true}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true} /* Auto limit events to fit height */
                                    contentHeight="auto"
                                    height="auto"
                                    dateClick={handleDateClick}
                                    eventDrop={handleEventDrop}
                                    eventClick={(arg) => {
                                        const event = events.find(e => e.id === arg.event.id);
                                        if (event) {
                                            setNewTask(event);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                    datesSet={handleDatesSet}
                                    eventContent={(arg) => {
                                        const type = arg.event.extendedProps.type;
                                        const colorClass =
                                            type === 'INSPECTION' ? 'border-l-blue-500 text-blue-700 bg-blue-50/50' :
                                                type === 'REPAIR' ? 'border-l-orange-500 text-orange-700 bg-orange-50/50' :
                                                    type === 'REPLACE' ? 'border-l-purple-500 text-purple-700 bg-purple-50/50' :
                                                        'border-l-red-500 text-red-700 bg-red-50/50'; // Emergency

                                        return (
                                            <div className={`px-2 py-1 text-[11px] font-bold border-l-4 truncate w-full rounded-r hover:opacity-80 transition-all cursor-pointer ${colorClass}`}>
                                                {arg.event.title}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right: Sidebar Task List */}
                        <div className="w-[340px] bg-white flex flex-col border-l border-gray-100 bg-gray-50/30">
                            <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center h-[73px]"> {/* Match toolbar height roughly */}
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                                    일정 목록
                                </h3>
                                <div className="relative">
                                    <button onClick={() => setIsSidebarMenuOpen(!isSidebarMenuOpen)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><MoreHorizontal size={20} /></button>
                                    {isSidebarMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-max bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[120px]">
                                            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-50 whitespace-nowrap">날짜순 정렬</button>
                                            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 font-medium border-b border-gray-50 whitespace-nowrap">등록순 정렬</button>
                                            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-blue-600 font-bold whitespace-nowrap">엑셀 내보내기</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[800px] custom-scrollbar">
                                {currentViewEvents
                                    .filter(e => {
                                        const matchesSearch = e.title.includes(searchTerm) ||
                                            e.inCharge.includes(searchTerm) ||
                                            (e.facilityName && e.facilityName.includes(searchTerm));
                                        const matchesType = filterTypes.includes(e.type);
                                        return matchesSearch && matchesType;
                                    })
                                    .length > 0 ?
                                    currentViewEvents
                                        .filter(e => {
                                            const matchesSearch = e.title.includes(searchTerm) ||
                                                e.inCharge.includes(searchTerm) ||
                                                (e.facilityName && e.facilityName.includes(searchTerm));
                                            const matchesType = filterTypes.includes(e.type);
                                            return matchesSearch && matchesType;
                                        })
                                        .map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => { setNewTask({ ...task, isAllDay: task.isAllDay ?? true }); setIsModalOpen(true); }}
                                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border
                                            ${task.type === 'EMERGENCY' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            task.type === 'REPLACE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                task.type === 'REPAIR' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                    'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {getTypeLabel(task.type)}
                                                    </span>
                                                    {task.status === 'COMPLETED' ?
                                                        <CheckCircle size={14} className="text-gray-400" /> :
                                                        <Clock size={14} className="text-blue-500" />
                                                    }
                                                </div>

                                                <h4 className={`font-bold text-sm mb-1 ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                    {task.title}
                                                </h4>

                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                                    <span className="flex items-center gap-1"><CalIcon size={12} /> {task.start}</span>
                                                    <span className="flex items-center gap-1"><User size={12} /> {task.inCharge}</span>
                                                </div>
                                            </div>
                                        )) : (
                                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <CalendarIconPlaceholder />
                                            </div>
                                            <p className="text-sm">표시할 일정이 없습니다.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB CONTENT: HISTORY --- */}
            {activeTab === 'HISTORY' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 mb-1">점검 완료율</p>
                                <div className="text-3xl font-extrabold text-gray-900">{getStats().rate}%</div>
                                <p className="text-xs text-blue-600 font-bold mt-1">계획 대비 진행률</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 mb-1">이상 발생률</p>
                                <div className="text-3xl font-extrabold text-gray-900">{getStats().anomalyRate}%</div>
                                <p className="text-xs text-red-600 font-bold mt-1">점검 중 이상 발견</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <AlertCircle size={24} />
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <List size={20} className="text-gray-500" />
                                점검 이력 목록
                            </h3>
                            <button className="text-sm font-bold text-blue-600 hover:underline">엑셀 다운로드</button>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-bold">점검 일자</th>
                                    <th className="p-4 font-bold">시설명</th>
                                    <th className="p-4 font-bold">점검 항목</th>
                                    <th className="p-4 font-bold">결과</th>
                                    <th className="p-4 font-bold">처리 내용</th>
                                    <th className="p-4 font-bold">담당자</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredEvents.map(task => ( // Changed from 'events' to 'filteredEvents'
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{task.start}</td>
                                        <td className="p-4 text-gray-700">{task.facilityName || '-'}</td>
                                        <td className="p-4 text-gray-700">{task.checkItem || task.title}</td>
                                        <td className="p-4">
                                            {task.result === 'GOOD' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">정상</span>}
                                            {task.result === 'BAD' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">이상 발견</span>}
                                            {(!task.result || task.result === 'PENDING') && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">-</span>}
                                        </td>
                                        <td className="p-4 text-gray-500">{task.description || '-'}</td>
                                        <td className="p-4 font-bold text-gray-800">{task.inCharge}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredEvents.length === 0 && ( // Changed from 'events' to 'filteredEvents'
                            <div className="p-10 text-center text-gray-400 text-sm">데이터가 없습니다.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                <Plus size={18} className="text-blue-600" />
                                {newTask.id ? '일정 수정' : '새 점검 계획 등록'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">작업명</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-bold text-gray-800"
                                    placeholder="예: 송풍기 정기 점검"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">시설명</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="예: 백운광장 펌프장"
                                        value={newTask.facilityName || ''}
                                        onChange={e => setNewTask({ ...newTask, facilityName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">담당자</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                        placeholder="담당자 이름"
                                        value={newTask.inCharge}
                                        onChange={e => setNewTask({ ...newTask, inCharge: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">점검 항목</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    placeholder="예: 모터 진동 및 소음, 윤활유 상태"
                                    value={newTask.checkItem || ''}
                                    onChange={e => setNewTask({ ...newTask, checkItem: e.target.value })}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">일정 설정</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newTask.isAllDay ?? true}
                                            onChange={e => setNewTask({ ...newTask, isAllDay: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-xs font-bold text-gray-700">종일 일정</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">시작일</label>
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 bg-white p-2 rounded text-sm outline-none focus:border-blue-500"
                                                value={newTask.start}
                                                onChange={e => setNewTask({ ...newTask, start: e.target.value })}
                                            />
                                            {!newTask.isAllDay && (
                                                <input
                                                    type="time"
                                                    className="w-full border border-gray-200 bg-white p-2 rounded text-sm outline-none focus:border-blue-500 animate-in slide-in-from-top-1"
                                                    value={newTask.startTime || '09:00'}
                                                    onChange={e => setNewTask({ ...newTask, startTime: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">종료일</label>
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 bg-white p-2 rounded text-sm outline-none focus:border-blue-500"
                                                value={newTask.end || newTask.start}
                                                onChange={e => setNewTask({ ...newTask, end: e.target.value })}
                                            />
                                            {!newTask.isAllDay && (
                                                <input
                                                    type="time"
                                                    className="w-full border border-gray-200 bg-white p-2 rounded text-sm outline-none focus:border-blue-500 animate-in slide-in-from-top-1"
                                                    value={newTask.endTime || '18:00'}
                                                    onChange={e => setNewTask({ ...newTask, endTime: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">작업 유형</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['INSPECTION', 'EMERGENCY', 'REPLACE', 'REPAIR'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewTask({ ...newTask, type: type as any })}
                                            className={`py-2 rounded-lg text-[10px] font-bold transition-all border
                                                ${newTask.type === type ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                                            `}
                                        >
                                            {getTypeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {newTask.id && (
                                    <button
                                        onClick={() => {
                                            if (confirm('정말 삭제하시겠습니까?')) {
                                                setEvents(events.filter(e => e.id !== newTask.id));
                                                setIsModalOpen(false);
                                            }
                                        }}
                                        className="h-10 px-4 bg-white border border-gray-200 text-red-600 font-bold rounded-lg hover:bg-red-50 hover:border-red-100 transition-colors text-sm"
                                    >
                                        삭제
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (!newTask.title || !newTask.start) return;
                                        if (newTask.id) {
                                            // Update
                                            setEvents(events.map(e => e.id === newTask.id ? { ...newTask, id: e.id } as MaintenanceTask : e));
                                        } else {
                                            // Create
                                            setEvents([...events, { ...newTask, id: String(Date.now()), status: 'SCHEDULED' } as MaintenanceTask]);
                                        }
                                        setIsModalOpen(false);
                                    }}
                                    className={`flex-1 h-10 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 text-sm flex items-center justify-center gap-2`}
                                >
                                    {newTask.id ? <><CheckCircle size={16} />수정사항 저장</> : <><Plus size={16} />일정 등록</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarIconPlaceholder = () => (
    <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default MaintenanceWork;
