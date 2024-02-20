import { tileLayer } from 'leaflet';
import { ITileLayer } from 'src/modules/ui/models/map.model';

export const wmsLayersOptions = {
  format: 'image/png',
  transparent: true,
  zIndex: 500,
};

export const wmsLayersOverlayOptions = {
  format: 'image/png',
  transparent: true,
  zIndex: 499,
};

export const baseLayers: ITileLayer[] = [
  {
    title: 'Satellite map',
    name: 'FULL_KR_TCI',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:FULL_KR_TCI',
      ...wmsLayersOverlayOptions,
      zIndex: 400,
    }),
  },
  {
    title: 'Google Streets',
    name: 'Google Streets',
    layer: tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    title: 'Google Terrain',
    name: 'Google Terrain',
    layer: tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
  },
  {
    title: 'Open Street Map',
    name: 'Open Street Map',
    layer: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
  },
  {
    title: 'Base Map',
    name: 'Base Map',
    layer: tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    ),
  },
];

export const wmsLayers: ITileLayer[] = [
  {
    title: 'Base',
    name: 'contours_main',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:contours_main',
      ...wmsLayersOptions,
    }),
    type: 'radio',
  },
  {
    title: 'RSE',
    name: 'contours_main_ai',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:contours_main_ai',
      ...wmsLayersOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'SoilLayer',
    name: 'soil_agromap',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:soil_agromap',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'NDVI heat map',
    name: 'ndvi_heat_map',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:ndvi_heat_map',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Forestry',
    name: 'agromap:forestry',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:forestry',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'On-farm channels',
    name: 'agromap:Внутрихозяйственные_каналы',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:Внутрихозяйственные_каналы',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Inter-farm channels',
    name: 'agromap:Межхозяйственные_каналы',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:Межхозяйственные_каналы',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Tepke',
    name: 'agromap:Tepke_20cm(EPSG:7695)',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:Tepke_20cm(EPSG:7695)',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'AWU',
    name: 'agromap:АВП',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:АВП',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Regions borders',
    name: 'kyrgyz:Oblast',
    layer: tileLayer.wms('https://isul.forest.gov.kg/geoserver/kyrgyz/wms', {
      layers: 'kyrgyz:Oblast',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Districts borders',
    name: 'kyrgyz:Raion',
    layer: tileLayer.wms('https://isul.forest.gov.kg/geoserver/kyrgyz/wms', {
      layers: 'kyrgyz:Raion',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
  {
    title: 'Karagana Suusamyr valley',
    name: 'agromap:Karagana_Suusamyr_Valley2020',
    layer: tileLayer.wms('https://geoserver.24mycrm.com/agromap/wms', {
      layers: 'agromap:Karagana_Suusamyr_Valley2020',
      ...wmsLayersOverlayOptions,
    }),
    type: 'checkbox',
  },
];

export const wmsProductivityLayerColorLegend: Record<string, any>[] = [
  { label: '-1', color: '#000000' },
  { label: '0.055', color: '#800000' },
  { label: '0.075', color: '#ff0000' },
  { label: '0.16', color: '#FFEA00' },
  { label: '0.401', color: '#359b52' },
  { label: '1', color: '#004529' },
];

export const storageNames = {
  sidePanel: 'SidePanelCompoent',
  mapControlLayersSwitchComponent: 'MapControlLayersSwitchComponent',
  arableLandComponent: 'ArableLandComponent',
  selectedLayerFeature: 'selectedLayerFeature',
  contourFilterComponent: 'ContourFilterComponent',
};
