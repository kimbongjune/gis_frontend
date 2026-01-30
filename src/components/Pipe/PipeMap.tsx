import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import { Style, Stroke, Icon, Circle, Fill } from 'ol/style';
import { PipeData } from '../../types';

interface PipeMapProps {
    pipes: PipeData[];
    selectedPipe: PipeData | null;
    onPipeClick: (pipe: PipeData | null) => void;
}

const PipeMap: React.FC<PipeMapProps> = ({ pipes, selectedPipe, onPipeClick }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const overlayInstance = useRef<Overlay | null>(null);
    const vectorSource = useRef<VectorSource>(new VectorSource());

    // Popup State
    const [popupPipe, setPopupPipe] = React.useState<PipeData | null>(null);

    useEffect(() => {
        if (!mapRef.current || !popupRef.current) return;

        // Create Overlay
        const overlay = new Overlay({
            element: popupRef.current,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -10],
        });
        overlayInstance.current = overlay;

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({
                    source: vectorSource.current,
                    style: (feature) => {
                        const type = feature.get('type');
                        const status = feature.get('status');
                        const isSelected = feature.get('isSelected');

                        if (type === 'PIPE') {
                            let color = '#22c55e'; // Normal
                            if (status === 'WARNING') color = '#f97316';
                            if (status === 'CRITICAL') color = '#ef4444';
                            if (isSelected) color = '#3b82f6';

                            return new Style({
                                stroke: new Stroke({
                                    color: color,
                                    width: isSelected ? 5 : 3,
                                }),
                            });
                        } else {
                            return new Style({
                                image: new Circle({
                                    radius: 6,
                                    fill: new Fill({ color: '#fff' }),
                                    stroke: new Stroke({ color: '#666', width: 2 })
                                })
                            });
                        }
                    },
                }),
            ],
            overlays: [overlay],
            view: new View({
                center: fromLonLat([126.9133, 35.1292]),
                zoom: 15,
            }),
        });

        mapInstance.current = map;

        return () => {
            map.setTarget(undefined);
        };
    }, []);

    // Handle Interactions (Click / Hover)
    useEffect(() => {
        if (!mapInstance.current || !overlayInstance.current) return;
        const map = mapInstance.current;
        const overlay = overlayInstance.current;

        const handleClick = (event: any) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, (f) => {
                const type = f.get('type');
                if (type === 'PIPE') return f;
                return undefined;
            }, {
                hitTolerance: 10
            });

            if (feature) {
                const pipeId = feature.get('id');
                const pipe = pipes.find(p => p.id === pipeId);
                if (pipe) {
                    onPipeClick(pipe);
                    setPopupPipe(pipe);
                    overlay.setPosition(event.coordinate);
                }
            } else {
                // Deselect
                overlay.setPosition(undefined);
                setPopupPipe(null);
                onPipeClick(null); // Clear selection in parent
            }
        };

        const handlePointerMove = (event: any) => {
            if (event.dragging) return;
            const pixel = map.getEventPixel(event.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel, { hitTolerance: 5 });
            map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        };

        map.on('click', handleClick);
        map.on('pointermove', handlePointerMove);

        return () => {
            map.un('click', handleClick);
            map.un('pointermove', handlePointerMove);
        };
    }, [pipes, onPipeClick]); // Re-bind when pipes change to avoid stale closures

    // Update Features 
    useEffect(() => {
        if (!vectorSource.current) return;
        vectorSource.current.clear();

        pipes.forEach((pipe) => {
            const lineFeature = new Feature({
                geometry: new LineString(pipe.coordinates.map(coord => fromLonLat(coord))),
                type: 'PIPE',
                status: pipe.status,
                id: pipe.id,
                isSelected: selectedPipe?.id === pipe.id
            });
            vectorSource.current.addFeature(lineFeature);

            // Add Manholes as start/end points
            const startPoint = new Feature({
                geometry: new Point(fromLonLat(pipe.coordinates[0])),
                type: 'MANHOLE'
            });
            const endPoint = new Feature({
                geometry: new Point(fromLonLat(pipe.coordinates[pipe.coordinates.length - 1])),
                type: 'MANHOLE'
            });
            vectorSource.current.addFeature(startPoint);
            vectorSource.current.addFeature(endPoint);
        });
    }, [pipes, selectedPipe]);

    // Pan to selected
    useEffect(() => {
        if (selectedPipe && mapInstance.current) {
            const center = selectedPipe.coordinates[Math.floor(selectedPipe.coordinates.length / 2)];
            mapInstance.current.getView().animate({
                center: fromLonLat(center),
                zoom: 17,
                duration: 1000
            });
            // Also show popup if selected from list
            if (overlayInstance.current) {
                setPopupPipe(selectedPipe);
                overlayInstance.current.setPosition(fromLonLat(center));
            }
        }
    }, [selectedPipe]);

    const handleClosePopup = () => {
        if (overlayInstance.current) {
            overlayInstance.current.setPosition(undefined);
            setPopupPipe(null);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full" />

            {/* Popup Container (Managed by OpenLayers Overlay) */}
            <div ref={popupRef} className="bg-white p-4 rounded shadow-lg border border-gray-200 text-sm min-w-[200px]">
                {popupPipe && (
                    <>
                        <h4 className="font-bold mb-2 border-b pb-1 flex justify-between items-center">
                            {popupPipe.name}
                            <button onClick={handleClosePopup} className="text-gray-400 hover:text-gray-900">×</button>
                        </h4>
                        <div className="space-y-1">
                            <p><span className="text-gray-500 w-16 inline-block">ID:</span> <span className="font-mono">{popupPipe.id}</span></p>
                            <p><span className="text-gray-500 w-16 inline-block">종류:</span> {popupPipe.type}</p>
                            <p><span className="text-gray-500 w-16 inline-block">설치년도:</span> {popupPipe.installYear}년</p>
                            <p><span className="text-gray-500 w-16 inline-block">길이:</span> {popupPipe.length}m</p>
                            <p><span className="text-gray-500 w-16 inline-block">상태:</span>
                                <span className={popupPipe.status === 'NORMAL' ? 'text-green-600 font-bold' : popupPipe.status === 'WARNING' ? 'text-orange-600 font-bold' : 'text-red-600 font-bold'}>
                                    {popupPipe.status}
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PipeMap;
