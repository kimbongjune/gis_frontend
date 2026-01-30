import React from 'react';
import { SensorData, ODOR_GRADES } from '../../types';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';

interface SensorTableProps {
    sensors: SensorData[];
    onSensorClick?: (sensor: SensorData) => void;
}

const SensorTable: React.FC<SensorTableProps> = ({ sensors, onSensorClick }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">실시간 센서 현황</h3>
                <span className="text-xs text-gray-400">전체 {sensors.length}개소</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">센서명</th>
                            <th className="px-4 py-3">상태</th>
                            <th className="px-4 py-3 text-right">복합악취 (OU)</th>
                            <th className="px-4 py-3 text-right">황화수소 (ppm)</th>
                            <th className="px-4 py-3 text-right">암모니아 (ppm)</th>
                            <th className="px-4 py-3 text-center">동작</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sensors.map((sensor) => {
                            const gradeInfo = ODOR_GRADES[sensor.grade] || { color: '#e5e7eb', label: '미수신' };
                            const isActive = sensor.status !== 'DISCONNECT';
                            
                            return (
                                <tr key={sensor.sensor_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {sensor.name}
                                        <div className="text-xs text-gray-400 font-normal">{sensor.sensor_id}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {sensor.status === 'DISCONNECT' ? (
                                                <>
                                                    <WifiOff size={14} className="text-gray-400" />
                                                    <span className="text-xs text-gray-500">통신불량</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: gradeInfo.color }}></div>
                                                    <span className="text-xs text-gray-700">{gradeInfo.label}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {isActive ? (sensor.values.voc || 0).toFixed(2) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {isActive ? (sensor.values.h2s || 0).toFixed(3) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {isActive ? (sensor.values.nh3 || 0).toFixed(3) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => onSensorClick && onSensorClick(sensor)}
                                            className="text-xs bg-white border border-gray-200 hover:bg-gray-50 hover:text-blue-600 px-2 py-1 rounded transition-colors text-gray-500"
                                        >
                                            상세보기
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {sensors.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SensorTable;
