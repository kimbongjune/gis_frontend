import React, { useState } from 'react';
import { Calendar as CalIcon, CheckSquare, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MaintenanceWork: React.FC = () => {
    // State for Calendar Navigation
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1)); // Feb 2026 default
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Mock Schedule
    const [tasks, setTasks] = useState([
        { id: 1, title: '백운광장 1호기 정기점검', date: '2026-02-01', type: '정기점검', status: 'SCHEDULED', inCharge: '김철수' },
        { id: 2, title: '봉선시장 센서 교체', date: '2026-02-03', type: '긴급보수', status: 'SCHEDULED', inCharge: '이영희' },
        { id: 3, title: '활성탄 교체 작업', date: '2026-02-15', type: '소모품교체', status: 'COMPLETED', inCharge: '박준호' },
        { id: 4, title: '이전 달 점검 이력', date: '2026-01-20', type: '정기점검', status: 'COMPLETED', inCharge: '김철수' },
    ]);

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const totalDays = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const emptyDays = Array.from({ length: firstDay });
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const formatDate = (day: number) => {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleAddTask = () => {
        if (!newTaskTitle) return;
        const targetDate = selectedDate || new Date().getDate();
        setTasks([...tasks, {
            id: Date.now(),
            title: newTaskTitle,
            date: formatDate(targetDate),
            type: '정기점검',
            status: 'SCHEDULED',
            inCharge: '시스템'
        }]);
        setNewTaskTitle('');
        setIsModalOpen(false);
    };

    // Filter Tasks
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const filteredTasks = tasks.filter(t => {
        // Filter by month
        if (!t.date.startsWith(currentMonthStr)) return false;
        // Filter by selected day if any
        if (selectedDate) {
            return parseInt(t.date.split('-')[2]) === selectedDate;
        }
        return true;
    });

    return (
        <div className="flex bg-white h-full rounded-lg shadow border border-gray-200">
            {/* Left: Calendar Area */}
            <div className="w-[420px] border-r border-gray-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <CalIcon size={20} /> 일정 관리
                    </h2>
                    <div className="flex items-center gap-2 bg-gray-50 rounded p-1 border">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow rounded"><ChevronLeft size={16} /></button>
                        <span className="text-sm font-bold w-20 text-center">
                            {currentDate.getFullYear()}. {String(currentDate.getMonth() + 1).padStart(2, '0')}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow rounded"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Visual Calendar */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                        {days.map(d => <div key={d} className={`py-2 text-center text-xs font-bold ${d === '일' ? 'text-red-500' : 'text-gray-500'}`}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7">
                        {emptyDays.map((_, i) => <div key={`empty-${i}`} className="h-12 border-b border-r bg-gray-50/30"></div>)}
                        {daysArray.map(d => {
                            const dateStr = formatDate(d);
                            const dayTasks = tasks.filter(t => t.date === dateStr);
                            const hasTask = dayTasks.length > 0;

                            return (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDate(d)}
                                    className={`h-12 border-b border-r last:border-r-0 hover:bg-blue-50 relative flex flex-col items-center justify-center transition-colors
                                        ${selectedDate === d ? 'bg-blue-100 text-blue-700 ring-2 ring-inset ring-blue-300 z-10' : ''}
                                    `}
                                >
                                    <span className={`text-sm ${selectedDate === d ? 'font-bold' : ''}`}>{d}</span>
                                    {hasTask && (
                                        <div className="flex gap-0.5 mt-1">
                                            {dayTasks.map(t => (
                                                <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.status === 'COMPLETED' ? 'bg-gray-400' : 'bg-green-500'}`}></span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto bg-blue-50/50 p-4 rounded border border-blue-100">
                    <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center gap-2"><Clock size={14} /> {currentDate.getMonth() + 1}월 점검 통계</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">총 일정</span>
                            <span className="font-bold">{tasks.filter(t => t.date.startsWith(currentMonthStr)).length}건</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Task List */}
            <div className="flex-1 p-6 flex flex-col bg-gray-50/30">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {selectedDate ? `${currentDate.getMonth() + 1}월 ${selectedDate}일 일정` : `${currentDate.getMonth() + 1}월 전체 일정`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredTasks.length > 0 ? `${filteredTasks.length}건의 업무가 있습니다.` : '등록된 업무가 없습니다.'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 font-bold flex items-center gap-1 transition-transform active:scale-95"
                    >
                        <Plus size={16} /> 일정 등록
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`p-5 rounded-xl border flex items-center gap-4 transition-all hover:shadow-md bg-white ${task.status === 'COMPLETED' ? 'border-gray-200 opacity-75' : 'border-blue-100'}`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${task.status === 'COMPLETED' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                                {task.status === 'COMPLETED' ? <CheckSquare size={20} /> : <Clock size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</h4>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                                    <span className="flex items-center gap-1"><CalIcon size={12} /> {task.date}</span>
                                    <span className="flex items-center gap-1">👤 {task.inCharge}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs border ${task.type === '긴급보수' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{task.type}</span>
                                </div>
                            </div>
                            <div>
                                {task.status === 'SCHEDULED' && (
                                    <button className="text-blue-600 hover:bg-blue-50 font-bold text-sm border border-blue-100 px-4 py-2 rounded-lg transition-colors">
                                        처리
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <CalIcon size={48} className="mb-4 text-gray-200" />
                            <p>등록된 일정이 없습니다.</p>
                            <p className="text-sm">새로운 업무를 등록해보세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white items-center rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                            <h3 className="font-bold text-lg">새 일정 등록</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-700 p-1 rounded transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">날짜</label>
                                <div className="text-lg font-bold text-blue-600 border-b pb-2">
                                    {formatDate(selectedDate || new Date().getDate())}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">작업명</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    placeholder="예: 정기 필터 교체"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAddTask}
                                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                등록 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceWork;
