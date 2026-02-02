import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Info, AlertTriangle, Upload, X } from 'lucide-react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { fromLonLat } from 'ol/proj';
import LayerTree from '../components/GIS/LayerTree';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transformExtent } from 'ol/proj';
import XYZ from 'ol/source/XYZ';

const TestMap: React.FC = () => {
    const VWORLD_API_KEY = "AD6FA481-A946-39F9-AB98-550D90784C10"
    // State
    const [activeLayers, setActiveLayers] = useState<string[]>(['ne:coastlines']);
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<string[]>([]);

    // Upload State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadWorkspace, setUploadWorkspace] = useState('');
    const [uploadCrs, setUploadCrs] = useState('EPSG:5186');

    // Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new XYZ ({
                        url: `http://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
                    })
                })
            ],
            view: new View({
                center: fromLonLat([126.9133, 35.1292]), // Gwangju Nam-gu center
                zoom: 15,
                projection: 'EPSG:3857'
            })
        });

        // Feature Info Interaction (GetFeatureInfo)
        map.on('singleclick', async (evt) => {
            const view = map.getView();
            let foundFeature = false;
            const layers = map.getLayers().getArray();

            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i] as any;
                const source = layer.getSource ? layer.getSource() : null;

                if (source instanceof TileWMS) {
                    const url = source.getFeatureInfoUrl(
                        evt.coordinate,
                        view.getResolution()!,
                        view.getProjection(),
                        {
                            'INFO_FORMAT': 'application/json',
                            'FEATURE_COUNT': 1
                        }
                    );

                    if (url) {
                        try {
                            const response = await axios.get(url);
                            const data = response.data;
                            if (data.features && data.features.length > 0) {
                                setSelectedFeature(data.features[0].properties);
                                foundFeature = true;
                                break; // Stop after finding first feature
                            }
                        } catch (e) {
                            // Console error is expected if geoserver is offline
                            console.warn("WMS GetFeatureInfo failed (Geoserver might be offline)");
                        }
                    }
                }
            }
            if (!foundFeature) {
                setSelectedFeature(null);
            }
        });

        mapInstance.current = map;
        return () => map.setTarget(undefined);
    }, []);

    // Fetch Workspaces on component mount
    useEffect(() => {
        axios.get('http://localhost:8081/api/geo/workspaces')
            .then(res => {
                setWorkspaces(res.data);
                if (res.data.length > 0) {
                    setUploadWorkspace(res.data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch workspaces", err));
    }, []);

    // Update Layers when activeLayers change
    useEffect(() => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;
        const wmsLayers = map.getLayers().getArray().filter(l => (l as any).getSource && (l as any).getSource() instanceof TileWMS);
        wmsLayers.forEach(l => map.removeLayer(l));

        activeLayers.forEach(layerId => {
            const wmsLayer = new TileLayer({
                source: new TileWMS({
                    url: 'http://localhost:8100/geoserver/wms',
                    params: {
                        'LAYERS': layerId,
                        'TILED': true,
                        'VERSION': '1.1.0'
                    },
                    serverType: 'geoserver',
                    crossOrigin: 'anonymous'
                })
            });
            map.addLayer(wmsLayer);
        });

        // Auto-Zoom
        const lastAddedLayerId = activeLayers[activeLayers.length - 1];
        if (lastAddedLayerId) {
            const [workspace, layerName] = lastAddedLayerId.split(':');
            if (workspace && layerName) {
                const fetchExtent = async () => {
                    try {
                        const res = await axios.get(`http://localhost:8081/api/geo/workspaces/${workspace}/layers/${layerName}/extent`);
                        const bbox = res.data; // { minx, miny, maxx, maxy, crs }

                        if (bbox && (bbox.minx !== bbox.maxx)) {
                            const extent = [bbox.minx, bbox.miny, bbox.maxx, bbox.maxy];
                            const bboxCrs = bbox.crs || "EPSG:5186"; // Default to 5186 if missing
                            if (bboxCrs === "EPSG:5186") {
                                proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                                register(proj4);
                            }
                            let finalExtent = extent;
                            if (bboxCrs !== 'EPSG:3857') {
                                finalExtent = transformExtent(extent, bboxCrs, 'EPSG:3857');
                            }
                            map.getView().fit(finalExtent, { padding: [50, 50, 50, 50], duration: 500 });
                        }
                    } catch (err) {
                        console.warn("Failed to fetch/zoom to layer extent", err);
                    }
                };
                fetchExtent();
            }
        }
    }, [activeLayers]);

    const handleLayerToggle = (layerId: string, checked: boolean) => {
        if (checked) {
            setActiveLayers(prev => [...prev, layerId]);
        } else {
            setActiveLayers(prev => prev.filter(id => id !== layerId));
        }
    };

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadFile) return;

        setUploading(true);
        try {
            // Use selected workspace or default
            const targetWorkspace = uploadWorkspace || (workspaces.length > 0 ? workspaces[0] : 'cite');

            // Try to find an EXISTING Datastore (e.g. PostGIS)
            let targetStore = uploadFile.name.split('.')[0];

            const formData = new FormData();
            formData.append("workspace", targetWorkspace);
            formData.append("storeName", targetStore);
            formData.append("crs", uploadCrs);
            formData.append("file", uploadFile);

            await axios.post('http://localhost:8081/api/geo/publish', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`업로드 및 보정 성공!\n워크스페이스: ${targetWorkspace}\n저장소: ${targetStore}\nCRS: ${uploadCrs}`);
            setIsUploadModalOpen(false);
            setUploadFile(null);

            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("업로드 실패: " + e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex gap-4 h-[calc(100vh-180px)] overflow-hidden">
            {/* Left Control Panel: Workspace & Search */}
            <div className="w-96 bg-white rounded-lg shadow border border-gray-200 flex flex-col p-4 shrink-0 h-full">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <Search size={20} /> 시설물 정보 (GeoServer Test)
                </h2>

                <div className="flex gap-2 mb-6 shrink-0 items-center h-10">
                    <input type="text" placeholder="시설명/위치 검색" className="flex-1 border rounded px-3 h-full text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 h-full text-sm font-bold transition-colors whitespace-nowrap flex items-center justify-center">검색</button>
                    <button
                        onClick={handleUploadClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded px-3 h-full flex items-center justify-center transition-colors aspect-square"
                        title="SHP 업로드"
                    >
                        <Upload size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                    <LayerTree checkedLayers={activeLayers} onToggleLayer={handleLayerToggle} />
                </div>

                <div className="mt-4 bg-orange-50 p-3 rounded text-xs text-orange-800 border border-orange-100 shrink-0">
                    <AlertTriangle size={14} className="inline mb-1 mr-1" />
                    <strong>테스트 모드</strong><br />
                    이 페이지는 GeoServer 연동 테스트 전용입니다. 실제 운영에는 포함되지 않습니다.
                </div>
            </div>

            {/* Center Map */}
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 relative overflow-hidden">
                <div ref={mapRef} className="w-full h-full" />

                {/* Upload Modal */}
                {isUploadModalOpen && (
                    <div className="absolute inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">레이어(Shapefile) 업로드</h3>
                                <button onClick={() => setIsUploadModalOpen(false)}><X size={20} /></button>
                            </div>

                            <div className="space-y-4 mb-6">
                                {/* Workspace Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">워크스페이스 선택</label>
                                    <select
                                        className="w-full border p-2 rounded bg-white"
                                        value={uploadWorkspace}
                                        onChange={(e) => setUploadWorkspace(e.target.value)}
                                    >
                                        <option value="">워크스페이스 선택</option>
                                        {workspaces.map(ws => (
                                            <option key={ws} value={ws}>{ws}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* CRS Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">좌표계 (CRS)</label>
                                    <select
                                        className="w-full border p-2 rounded bg-white"
                                        value={uploadCrs}
                                        onChange={(e) => setUploadCrs(e.target.value)}
                                    >
                                        <option value="EPSG:5186">EPSG:5186 (Korea 2000 / Central Belt 2010)</option>
                                        <option value="EPSG:4326">EPSG:4326 (WGS84)</option>
                                        <option value="EPSG:3857">EPSG:3857 (Web Mercator)</option>
                                        <option value="EPSG:5174">EPSG:5174 (Tokyo / Central Belt)</option>
                                    </select>
                                </div>

                                {/* File Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Shapefile (zip)</label>
                                    <input type="file" accept=".zip" onChange={handleFileChange} className="w-full border p-2 rounded" />
                                    <p className="text-xs text-gray-500 mt-1">.shp, .shx, .dbf 등을 포함한 zip 파일</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">취소</button>
                                <button
                                    onClick={handleUploadSubmit}
                                    disabled={!uploadFile || uploading}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 w-32 flex items-center justify-center whitespace-nowrap"
                                >
                                    {uploading ? '처리중...' : '발행'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Popup */}
                {selectedFeature && (
                    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-lg border border-gray-100 min-w-[280px] animate-in fade-in slide-in-from-right-4 z-50">
                        <div className="flex justify-between items-start mb-3 border-b pb-2">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <Info size={16} className="text-blue-500" />
                                {selectedFeature.name || selectedFeature.id || '시설물 상세정보'}
                            </h4>
                            <button onClick={() => setSelectedFeature(null)} className="text-gray-400 hover:text-gray-900">×</button>
                        </div>
                        <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                            {Object.entries(selectedFeature).map(([key, value]) => (
                                key !== 'geometry' && (
                                    <div key={key} className="flex justify-between border-b border-gray-50 pb-1 last:border-0">
                                        <span className="text-gray-500 font-medium">{key}</span>
                                        <span className="text-gray-800 font-mono text-xs">{String(value)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestMap;
