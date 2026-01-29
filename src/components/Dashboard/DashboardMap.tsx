import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM'; // Or VWorld if requested, prompt asked for "OpenLayers 기반" but later asked "OpenLayers와 VWorld를 연동한 지도 컴포넌트의 상세 코드 예시는?"
// The prompt in section 2.A says "OpenLayers 기반 지도".
// In section "출력 요청", item 2 says "DashboardMap.tsx: [UI-001]의 OpenLayers 지도 컴포넌트".
// The question at the end asks for VWorld example.
// I will use OSM for now as a default, but VWorld is common for Korean gov services. I'll stick to OSM or XYZ source for VWorld if I had the key.
// Given strict "Digital Government" and "Korea", VWorld is better. But without API key, it might break.
// I'll implementation with OSM for stability, but structure it to easily swap to VWorld.
// Actually, I can use VWorld Base map if I use the XYZ source with the public URL (sometimes works).
// Let's stick to standard OpenLayers implementation standards.

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { SensorData, ODOR_GRADES } from '../../types';

interface DashboardMapProps {
    sensors: SensorData[];
}

const DashboardMap: React.FC<DashboardMapProps> = ({ sensors }) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const popupElement = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const overlayRef = useRef<Overlay | null>(null);
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

    useEffect(() => {
        if (!mapElement.current || !popupElement.current) return;

        // Initialize Overlay
        const overlay = new Overlay({
            element: popupElement.current,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
        });
        overlayRef.current = overlay;

        // Initialize Map
        const map = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new OSM(), // Replace with VWorld XYZ source if needed
                }),
            ],
            view: new View({
                center: fromLonLat([126.9113, 35.1272]), // Gwangju Nam-gu approximate center
                zoom: 13,
            }),
            overlays: [overlay],
        });

        mapRef.current = map;

        // Click Interaction
        map.on('click', (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
            if (feature) {
                const sensor = feature.get('sensorData') as SensorData;
                setSelectedSensor(sensor);
                const coordinates = (feature.getGeometry() as Point).getCoordinates();
                overlay.setPosition(coordinates);
            } else {
                overlay.setPosition(undefined);
                setSelectedSensor(null);
            }
        });

        return () => {
            map.setTarget(undefined);
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapRef.current) return;

        const vectorSource = new VectorSource();

        sensors.forEach((sensor) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([sensor.longitude, sensor.latitude])),
                sensorData: sensor,
            });

            // Style based on Grade
            const gradeInfo = ODOR_GRADES[sensor.grade] || { color: '#666', label: '미수신' };
            const color = sensor.status === 'DISCONNECT' ? '#000000' : gradeInfo.color;

            const style = new Style({
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: color }),
                    stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
                text: new Text({
                    text: sensor.name,
                    offsetY: 15,
                    scale: 0.8,
                    fill: new Fill({ color: '#000' }),
                    stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
            });

            feature.setStyle(style);
            vectorSource.addFeature(feature);
        });

        // Remove old vector layers if any to avoid stacking
        const map = mapRef.current;
        const layersToRemove = map.getLayers().getArray().filter(layer => layer instanceof VectorLayer);
        layersToRemove.forEach(layer => map.removeLayer(layer));

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });
        map.addLayer(vectorLayer);

    }, [sensors]);

    return (
        <div className="relative w-full h-full min-h-[500px] border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <div ref={mapElement} className="w-full h-full" />

            {/* Popup Overlay */}
            <div ref={popupElement} className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] text-sm hidden">
                {selectedSensor && (
                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-gray-800 border-b pb-1">{selectedSensor.name}</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">상태:</span>
                            <span
                                className={`font-semibold px-2 py-0.5 rounded text-white`}
                                style={{ backgroundColor: selectedSensor.status === 'DISCONNECT' ? '#000' : ODOR_GRADES[selectedSensor.grade]?.color }}
                            >
                                {selectedSensor.status === 'DISCONNECT' ? '통신불량' : ODOR_GRADES[selectedSensor.grade]?.label}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span className="text-gray-500">H₂S:</span>
                            <span className="font-mono text-gray-900">{selectedSensor.values.h2s} ppm</span>
                            <span className="text-gray-500">NH₃:</span>
                            <span className="font-mono text-gray-900">{selectedSensor.values.nh3} ppm</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">
                            {new Date(selectedSensor.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow border border-gray-200 backdrop-blur-sm">
                <h4 className="text-xs font-semibold mb-2 text-gray-700">악취 등급</h4>
                <div className="flex flex-col gap-1">
                    {Object.entries(ODOR_GRADES).map(([grade, info]) => (
                        <div key={grade} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }}></div>
                            <span className="text-xs text-gray-600">{info.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-black"></div>
                        <span className="text-xs text-gray-600">통신불량</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardMap;
