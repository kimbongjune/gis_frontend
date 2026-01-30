import React from 'react';
import { PipeData } from '../../types';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface PipeListProps {
    pipes: PipeData[];
    selectedPipeId: string | undefined;
    onPipeClick: (pipe: PipeData) => void;
}

const PipeList: React.FC<PipeListProps> = ({ pipes, selectedPipeId, onPipeClick }) => {
    return (
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-700">검색 결과</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{pipes.length}건</span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {pipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                        <p>검색된 관로가 없습니다.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {pipes.map(pipe => (
                            <div
                                key={pipe.id}
                                onClick={() => onPipeClick(pipe)}
                                className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPipeId === pipe.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-gray-800 text-sm">{pipe.name}</div>
                                    <div className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{pipe.type === 'SEWAGE' ? '오수' : pipe.type === 'RAIN' ? '우수' : '합류'}</div>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-xs text-gray-500">
                                        ID: <span className="font-mono text-gray-700">{pipe.id}</span>
                                        <div className="flex gap-2 mt-1">
                                            <span>길이: {pipe.length}m</span>
                                            <span>|</span>
                                            <span>년도: {pipe.installYear}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {pipe.status === 'NORMAL' && <div className="flex items-center gap-1 text-xs text-green-600 font-bold"><CheckCircle size={14} /> 정상</div>}
                                        {pipe.status === 'WARNING' && <div className="flex items-center gap-1 text-xs text-orange-600 font-bold"><AlertTriangle size={14} /> 주의</div>}
                                        {pipe.status === 'CRITICAL' && <div className="flex items-center gap-1 text-xs text-red-600 font-bold"><AlertTriangle size={14} /> 위험</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PipeList;
