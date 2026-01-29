import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronDown, Layers, CheckSquare, Square } from 'lucide-react';

export interface GISLayer {
    id: string; // workspace:layerName
    name: string; // Display Name
    workspace: string;
    layerName: string;
}

export interface GISWorkspace {
    name: string;
    layers: GISLayer[];
}

// Friendly name mapping
const FRIENDLY_NAMES: Record<string, string> = {
    'pipe_network': '하수관거 네트워크',
    'manholes': '맨홀 지점',
    'pump_stations': '펌프장',
    'district_bnd': '행정구역 경계',
    'buildings': '주요 건물'
};

interface LayerTreeProps {
    checkedLayers: string[];
    onToggleLayer: (layerId: string, checked: boolean) => void;
}

const LayerTree: React.FC<LayerTreeProps> = ({ checkedLayers, onToggleLayer }) => {
    const [workspaces, setWorkspaces] = useState<GISWorkspace[]>([]);
    const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});

    // Fetch Workspaces & Layers from Backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Workspaces
                const wsRes = await fetch('http://localhost:8081/api/geo/workspaces');
                if (!wsRes.ok) throw new Error('Failed to fetch workspaces');
                const wsList: string[] = await wsRes.json();

                // 2. Get Layers for each Workspace
                const newWorkspaces: GISWorkspace[] = [];

                for (const wsName of wsList) {
                    if (wsName === 'gwangju_sw') continue; // Filter out if needed as per mock logic

                    try {
                        const layerRes = await fetch(`http://localhost:8081/api/geo/workspaces/${wsName}/layers`);
                        const layerList: string[] = await layerRes.json();

                        const layers: GISLayer[] = layerList.map(layerName => ({
                            id: `${wsName}:${layerName}`,
                            name: FRIENDLY_NAMES[layerName] || layerName, // Map or use raw
                            workspace: wsName,
                            layerName: layerName
                        }));

                        newWorkspaces.push({ name: wsName, layers });
                    } catch (e) {
                        console.error(`Failed to fetch layers for ${wsName}`, e);
                    }
                }

                setWorkspaces(newWorkspaces);
                // Default expand the first one if exists
                if (newWorkspaces.length > 0) {
                    setExpandedWorkspaces(prev => ({ ...prev, [newWorkspaces[0].name]: true }));
                }

            } catch (error) {
                console.error("GIS Backend Error:", error);
                // Fallback / Alert? For now just log.
            }
        };

        fetchData();
    }, []);

    const toggleWorkspace = (wsName: string) => {
        setExpandedWorkspaces(prev => ({
            ...prev,
            [wsName]: !prev[wsName]
        }));
    };

    return (
        <div className="w-full">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm px-2">
                <Layers size={16} /> 워크스페이스 목록
            </h3>
            <div className="bg-white border rounded text-sm select-none">
                {workspaces.length === 0 && (
                    <div className="p-4 text-gray-400 text-center text-xs">
                        데이터 로딩중... <br />(Backend: 8081)
                    </div>
                )}
                {workspaces.map(ws => (
                    <div key={ws.name} className="border-b last:border-0">
                        {/* Workspace Header */}
                        <div
                            className="flex items-center gap-2 p-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleWorkspace(ws.name)}
                        >
                            {expandedWorkspaces[ws.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="font-bold text-gray-800">{ws.name}</span>
                        </div>

                        {/* Layers List */}
                        {expandedWorkspaces[ws.name] && (
                            <div className="pl-6 pr-2 py-2 space-y-1 bg-white animate-in slide-in-from-top-1 duration-100">
                                {ws.layers.map(layer => {
                                    const isChecked = checkedLayers.includes(layer.id);
                                    return (
                                        <div
                                            key={layer.id}
                                            className="flex items-center gap-2 p-1 hover:bg-blue-50 rounded cursor-pointer group"
                                            onClick={() => onToggleLayer(layer.id, !isChecked)}
                                        >
                                            <div className={`text-blue-600 ${isChecked ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </div>
                                            <span className={`${isChecked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{layer.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerTree;
