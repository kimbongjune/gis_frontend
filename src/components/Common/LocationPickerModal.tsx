import React, { useEffect, useRef, useState } from 'react';
import { X, Check, MapPin } from 'lucide-react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (lat: number, lon: number, address: string) => void;
    initialLat?: number;
    initialLon?: number;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
    isOpen, onClose, onSelect, initialLat = 35.1272, initialLon = 126.9113
}) => {
    const mapElement = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const vectorSourceRef = useRef<VectorSource | null>(null);

    // Internal state for selected position
    const [selectedPos, setSelectedPos] = useState<{ lat: number, lon: number } | null>(null);
    const [address, setAddress] = useState<string>("");

    // Initialize Map
    useEffect(() => {
        if (!isOpen) return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (!mapElement.current) return;

            // Clean up existing map if any
            if (mapRef.current) {
                mapRef.current.setTarget(undefined);
            }

            const vectorSource = new VectorSource();
            vectorSourceRef.current = vectorSource;

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Default OL icon or use local
                        scale: 1
                    })
                })
            });

            const map = new Map({
                target: mapElement.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    vectorLayer
                ],
                view: new View({
                    center: fromLonLat([initialLon, initialLat]),
                    zoom: 14,
                }),
            });

            mapRef.current = map;

            // Handle Click
            map.on('click', (event) => {
                const coords = event.coordinate;
                const lonLat = toLonLat(coords);
                const lat = lonLat[1];
                const lon = lonLat[0];

                setSelectedPos({ lat, lon });
                setAddress(`광주 남구 봉선동 (임의 주소) ${lat.toFixed(4)}, ${lon.toFixed(4)}`); // Mock Reverse Geocoding

                // Add Marker
                vectorSource.clear();
                const feature = new Feature({
                    geometry: new Point(coords)
                });
                vectorSource.addFeature(feature);
            });

            // If initial position is valid, add marker
            if (initialLat !== 0 && initialLon !== 0) {
                const coords = fromLonLat([initialLon, initialLat]);
                const feature = new Feature({
                    geometry: new Point(coords)
                });
                vectorSource.addFeature(feature);
                setSelectedPos({ lat: initialLat, lon: initialLon });
            }

        }, 100);

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleConfirm = () => {
        if (selectedPos) {
            onSelect(selectedPos.lat, selectedPos.lon, address);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin size={20} className="text-blue-600" /> 위치 선택
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Map Content */}
                <div className="flex-1 relative bg-gray-100">
                    <div ref={mapElement} className="absolute inset-0 w-full h-full" />
                    {!selectedPos && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow text-sm font-semibold text-gray-700 pointer-events-none">
                            지도에서 위치를 클릭하세요
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-bold text-gray-600 mr-2">선택된 위치:</span>
                        {selectedPos ? (
                            <span className="text-gray-900">{address}</span>
                        ) : (
                            <span className="text-gray-400">선택되지 않음</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium">
                            취소
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedPos}
                            className={`px-6 py-2 rounded flex items-center gap-2 font-bold text-white transition-colors
                                ${selectedPos ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                        >
                            <Check size={18} /> 선택 완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;
