import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PipeFilter from '../components/Pipe/PipeFilter';
import PipeList from '../components/Pipe/PipeList';
import PipeMap from '../components/Pipe/PipeMap';
import SensorTable from '../components/Dashboard/SensorTable';
import { PipeData, SensorData } from '../types';

// Mock Data Generators
const generateMockPipes = (): PipeData[] => {
    return [
        { id: 'PIPE-001', name: '봉선로 1구역 하수관', type: 'SEWAGE', length: 120, installYear: 2018, status: 'NORMAL', location: 'Bongseon', coordinates: [[126.912, 35.129], [126.914, 35.130], [126.916, 35.131]] },
        { id: 'PIPE-002', name: '백운광장 우수관로', type: 'RAIN', length: 350, installYear: 2015, status: 'WARNING', location: 'Baekun', coordinates: [[126.910, 35.128], [126.912, 35.127], [126.914, 35.126]] },
        { id: 'PIPE-003', name: '진월동 합류관 B-Zone', type: 'COMBINED', length: 210, installYear: 2020, status: 'NORMAL', location: 'Jinwol', coordinates: [[126.905, 35.118], [126.908, 35.119], [126.910, 35.120]] },
        { id: 'PIPE-004', name: '양림동 역사문화거리 관로', type: 'SEWAGE', length: 85, installYear: 2012, status: 'CRITICAL', location: 'Yangrim', coordinates: [[126.915, 35.135], [126.914, 35.136], [126.913, 35.137]] },
        { id: 'PIPE-005', name: '서동 4구역 배수관', type: 'RAIN', length: 150, installYear: 2019, status: 'NORMAL', location: 'Seodong', coordinates: [[126.911, 35.132], [126.911, 35.133], [126.910, 35.134]] },
    ];
};

const generateMockSensors = (): SensorData[] => {
    // Reusing the structure but this would normally fetch based on selected pipe
    return [
        { sensor_id: 'S001', name: '백운광장 1', latitude: 35.129, longitude: 126.912, values: { h2s: 0.05, nh3: 1.2, voc: 0.5 }, grade: 1, status: 'NORMAL', timestamp: new Date().toISOString() },
        { sensor_id: 'S002', name: '봉선시장 입구', latitude: 35.125, longitude: 126.915, values: { h2s: 0.8, nh3: 5.5, voc: 2.1 }, grade: 3, status: 'ALARM', timestamp: new Date().toISOString() },
    ];
};

const PipeInformation: React.FC = () => {
    // State
    const [pipes, setPipes] = useState<PipeData[]>([]);
    const [filteredPipes, setFilteredPipes] = useState<PipeData[]>([]);
    const [selectedPipe, setSelectedPipe] = useState<PipeData | null>(null);
    const [filters, setFilters] = useState({
        region: 'ALL',
        type: 'ALL',
        status: 'ALL',
        installYear: 'ALL',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
    });
    const [relatedSensors, setRelatedSensors] = useState<SensorData[]>([]);
    const navigate = useNavigate();

    // Init Mock Data
    useEffect(() => {
        const data = generateMockPipes();
        setPipes(data);
        setFilteredPipes(data);
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = pipes;

        // Basic Filters
        if (filters.region !== 'ALL') result = result.filter(p => p.location === filters.region);
        if (filters.type !== 'ALL') result = result.filter(p => p.type === filters.type);
        if (filters.status !== 'ALL') result = result.filter(p => p.status === filters.status);

        // Install Year Filter
        if (filters.installYear !== 'ALL') {
            if (filters.installYear === 'OLD') {
                result = result.filter(p => p.installYear <= 2020);
            } else {
                result = result.filter(p => p.installYear === parseInt(filters.installYear));
            }
        }

        // Note: Date Range Filter usually applies to sensor data or logs, but for pipes maybe "Install Date"? 
        // Assuming user wants to filter pipes by install date if they were dates. 
        // Putting placeholder logic or ignoring if pipe data doesn't support full date.
        // For now, we only have 'installYear'. 

        setFilteredPipes(result);
    }, [filters, pipes]);

    // Handle Pipe Selection
    const handlePipeClick = (pipe: PipeData | null) => {
        setSelectedPipe(pipe);
        if (pipe) {
            // In real app, fetch sensors for this pipe ID. For now, random mock.
            setRelatedSensors(generateMockSensors().slice(0, Math.floor(Math.random() * 3) + 1));
        } else {
            setRelatedSensors([]);
        }
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDetailClick = (sensor: SensorData) => {
        navigate('/monitoring', { state: { sensorId: sensor.sensor_id } });
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)] overflow-hidden p-2">
            {/* Left Sidebar: Filter & List */}
            <div className="w-[320px] shrink-0 flex flex-col gap-4 h-full">
                <PipeFilter filters={filters} onFilterChange={handleFilterChange} />
                <PipeList
                    pipes={filteredPipes}
                    selectedPipeId={selectedPipe?.id}
                    onPipeClick={handlePipeClick}
                />
            </div>

            {/* Main Content: Map & Sensor Table */}
            <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                {/* Map (70%) */}
                <div className="flex-[7] bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-sm font-bold text-gray-700">
                        지도 기반 관로 탐색
                    </div>
                    <PipeMap
                        pipes={filteredPipes}
                        selectedPipe={selectedPipe}
                        onPipeClick={handlePipeClick}
                    />
                </div>

                {/* Sensor Table (30%) */}
                <div className="flex-[3] min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <h4 className="font-bold text-sm text-gray-800">
                            {selectedPipe ? `[${selectedPipe.name}] 연계 센서 정보` : '선택된 관로의 연계 센서 정보'}
                        </h4>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <SensorTable
                            sensors={relatedSensors}
                            onSensorClick={handleDetailClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PipeInformation;
