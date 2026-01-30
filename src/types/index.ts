export interface ControlRequest {
    facility_id: string;
    command: 'START' | 'STOP' | 'RESET';
    mode: 'AUTO' | 'MANUAL';
    operator_id: string; // 로그인한 사용자 ID
}

export interface SensorValue {
    h2s: number; // 황화수소 (ppm)
    nh3: number; // 암모니아 (ppm)
    voc: number; // 휘발성유기화합물 (ppm)
}

export interface SensorData {
    sensor_id: string;
    timestamp: string;
    values: SensorValue;
    grade: 1 | 2 | 3 | 4; // 1:좋음, 2:보통, 3:나쁨, 4:매우나쁨
    status: 'NORMAL' | 'ALARM' | 'DISCONNECT';
    latitude: number;
    longitude: number;
    name: string;
}

export interface Facility {
    id: string;
    name: string;
    region: string; // 읍면동
    status: 'RUNNING' | 'STOPPED' | 'ERROR';
    connectionStatus: 'CONNECTED' | 'DISCONNECTED';
    mode: 'AUTO' | 'MANUAL';
    lastCommunicationTime: string;
    powerUsage: number; // kWh
    chemicalLevel: number; // %
}

export interface ComplaintData {
    reporterName: string;
    contact: string;
    title: string;
    content: string;
    address: string;
    latitude: number;
    longitude: number;
    status: 'RECEIVED' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED';
    timestamp: string;
}

export interface PipeData {
    id: string;
    name: string;
    type: 'SEWAGE' | 'RAIN' | 'COMBINED';
    length: number; // meters
    installYear: number;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    location: string;
    coordinates: number[][]; // LineString coordinates
}

export type OdorGrade = 1 | 2 | 3 | 4;

export const ODOR_GRADES: Record<OdorGrade, { label: string; color: string }> = {
    1: { label: '좋음', color: '#22c55e' }, // Green
    2: { label: '보통', color: '#eab308' }, // Yellow
    3: { label: '나쁨', color: '#f97316' }, // Orange
    4: { label: '매우나쁨', color: '#ef4444' } // Red
};
