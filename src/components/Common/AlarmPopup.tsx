import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

interface AlarmPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onDetail?: () => void;
    data: {
        location: string;
        type: string;
        value: string;
        time: string;
        level: 'WARNING' | 'CRITICAL' | 'DISCONNECT';
    } | null;
}

const AlarmPopup: React.FC<AlarmPopupProps> = ({ isOpen, onClose, onDetail, data }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const getColors = () => {
        switch (data.level) {
            case 'CRITICAL':
                return { bg: 'bg-red-500', border: 'border-red-600', iconBg: 'bg-red-600', text: 'text-red-600' };
            case 'WARNING':
                return { bg: 'bg-orange-500', border: 'border-orange-600', iconBg: 'bg-orange-600', text: 'text-orange-600' };
            default:
                return { bg: 'bg-gray-500', border: 'border-gray-600', iconBg: 'bg-gray-600', text: 'text-gray-600' };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Backdrop excluded to allow interacting with background, or include if modal behavior desired. Usually alarm popups are intrusive overlays. */}
            <div className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-sm"></div>

            <div className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl border-2 ${colors.border} pointer-events-auto transform transition-all duration-300 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Header */}
                <div className={`${colors.bg} text-white p-4 rounded-t-lg flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-lg">긴급 경보 발생</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{data.location}</h3>
                            <p className={`${colors.text} font-bold text-lg`}>{data.type}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-gray-100">
                            <div className="text-center border-r border-gray-200">
                                <p className="text-xs text-gray-400 mb-1">측정 수치</p>
                                <p className="text-2xl font-mono font-bold text-gray-800">{data.value}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">발생 시각</p>
                                <p className="text-lg font-mono font-bold text-gray-800">{data.time}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                닫기
                            </button>
                            <button
                                onClick={onDetail}
                                className={`flex-1 px-4 py-3 ${colors.bg} text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md`}
                            >
                                상세 확인
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlarmPopup;
