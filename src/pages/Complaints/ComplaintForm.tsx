import React, { useState, useEffect, useRef } from 'react';
import { ComplaintData } from '../../types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';

// Type for Window to support Daum Postcode
declare global {
    interface Window {
        daum: any;
    }
}

const STEPS = ['접수', '배정', '처리중', '완료'];

const ComplaintForm: React.FC = () => {
    const [formData, setFormData] = useState<Partial<ComplaintData>>({
        reporterName: '',
        contact: '',
        title: '',
        content: '',
        address: '',
        status: 'RECEIVED'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: 접수

    // Map Refs
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const vectorSource = useRef<VectorSource | null>(null);

    // Load Daum Postcode Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;

        vectorSource.current = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource.current,
        });

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer
            ],
            view: new View({
                center: fromLonLat([126.9113, 35.1272]),
                zoom: 13,
            }),
        });

        mapInstance.current = map;

        return () => map.setTarget(undefined);
    }, []);

    // Update Map Pin
    useEffect(() => {
        if (!mapInstance.current || !vectorSource.current) return;

        vectorSource.current.clear();

        if (formData.latitude && formData.longitude) {
            const coords = fromLonLat([formData.longitude, formData.latitude]);

            const feature = new Feature({
                geometry: new Point(coords),
            });

            feature.setStyle(new Style({
                image: new Icon({
                    src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Fallback or use standard marker
                    scale: 0.05,
                    anchor: [0.5, 1],
                    color: '#ef4444' // Tint red
                })
            }));

            vectorSource.current.addFeature(feature);
            mapInstance.current.getView().animate({ center: coords, zoom: 16 });
        }
    }, [formData.latitude, formData.longitude]);

    const handleAddressSearch = () => {
        if (!window.daum || !window.daum.Postcode) {
            alert('주소 검색 서비스를 로딩 중입니다.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: function (data: any) {
                // In real app, we need to geocode this address to get lat/lon
                // Mocking Geocoding for now based on address length hash or random nearby
                // Using Kakao Geocoder is required strictly but we don't have key here.
                // We will simulate lat/lon update.

                const addr = data.address;
                setFormData(prev => ({ ...prev, address: addr }));

                // Mock Coords (Gwangju Nam-gu center)
                // Ideally we fetch coordinates using `data.address`
                setFormData(prev => ({ ...prev, latitude: 35.1272 + (Math.random() * 0.001), longitude: 126.9113 + (Math.random() * 0.001) }));
            }
        }).open();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.reporterName) newErrors.reporterName = '신고자명은 필수 입력입니다.';

        if (!formData.contact) {
            newErrors.contact = '연락처는 필수 입력입니다.';
        } else if (!/^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/.test(formData.contact)) {
            newErrors.contact = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678).';
        }

        if (!formData.title) newErrors.title = '민원 제목은 필수 입력입니다.';
        if (!formData.content) newErrors.content = '민원 내용은 필수 입력입니다.';
        if (!formData.address) newErrors.address = '민원 발생 위치를 선택해주세요.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            // Simulate API
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('민원이 성공적으로 접수되었습니다.');
            // Reset or redirect
            setFormData({ reporterName: '', contact: '', title: '', content: '', address: '', status: 'RECEIVED' });
            setCurrentStep(0);
        } catch (e) {
            alert('서버 연결에 실패했습니다.'); // Defined Error Message
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6 bg-white min-h-screen">
            <div className="mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">악취 민원 접수</h1>
                <p className="text-gray-500 text-sm mt-1">악취 발생 지역과 상세 내용을 입력해주시면 신속히 처리하겠습니다.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center mb-10 w-full">
                <div className="flex items-center w-full max-w-2xl">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="relative flex flex-col items-center">
                                <div
                                    aria-current={index === currentStep ? 'step' : undefined}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors z-10 ${index <= currentStep ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'}`}
                                >
                                    {index + 1}
                                </div>
                                <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {step}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex gap-8">
                {/* Form Section */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Reporter Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="reporterName" className="block text-sm font-semibold text-gray-700 mb-1">신고자명 <span className="text-red-500">*</span></label>
                                <input
                                    id="reporterName"
                                    type="text"
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reporterName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    value={formData.reporterName}
                                    onChange={e => setFormData({ ...formData, reporterName: e.target.value })}
                                />
                                {errors.reporterName && <span className="text-xs text-red-500 mt-1 block">{errors.reporterName}</span>}
                            </div>

                            <div>
                                <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-1">연락처 <span className="text-red-500">*</span></label>
                                <input
                                    id="contact"
                                    type="text"
                                    placeholder="010-0000-0000"
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contact ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    value={formData.contact}
                                    onChange={e => {
                                        // Auto-format phone number
                                        const val = e.target.value.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
                                        setFormData({ ...formData, contact: val.slice(0, 13) });
                                    }}
                                />
                                {errors.contact && <span className="text-xs text-red-500 mt-1 block">{errors.contact}</span>}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">발생 위치 <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    readOnly
                                    placeholder="주소 검색 버튼을 눌러주세요"
                                    className={`flex-1 border rounded px-3 py-2 text-sm bg-gray-50 text-gray-600 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.address}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddressSearch}
                                    className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded shrink-0 transition-colors"
                                >
                                    주소 검색
                                </button>
                            </div>
                            {errors.address && <span className="text-xs text-red-500 block">{errors.address}</span>}
                        </div>

                        {/* Complaint Detail */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">민원 제목 <span className="text-red-500">*</span></label>
                            <input
                                id="title"
                                type="text"
                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                            {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title}</span>}
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-1">민원 내용 <span className="text-red-500">*</span></label>
                            <textarea
                                id="content"
                                rows={6}
                                className={`w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                            {errors.content && <span className="text-xs text-red-500 mt-1 block">{errors.content}</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" className="px-5 py-2.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors font-medium">취소</button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-bold flex items-center gap-2"
                            >
                                {isSubmitting && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                민원 등록
                            </button>
                        </div>
                    </form>
                </div>

                {/* Map Section */}
                <div className="w-[350px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[500px] sticky top-6 shadow-sm">
                    <div className="p-3 bg-white border-b border-gray-100 font-bold text-gray-800 text-sm">
                        위치 확인
                    </div>
                    <div className="flex-1 relative">
                        <div ref={mapRef} className="absolute inset-0 w-full h-full bg-gray-100" />
                        {!formData.address && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-gray-500 text-sm pointer-events-none">
                                주소를 선택하면 지도에 표시됩니다.
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-white border-t border-gray-100 text-xs text-gray-500">
                        위도: {formData.latitude ? formData.latitude.toFixed(6) : '-'}, 경도: {formData.longitude ? formData.longitude.toFixed(6) : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintForm;
