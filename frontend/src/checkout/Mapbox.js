import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const apiKey = process.env.REACT_APP_MAPBOX_API_TOKEN;

export const MapboxMap = ReactMapboxGl({
    preserveDrawingBuffer: true,
    accessToken: apiKey
});