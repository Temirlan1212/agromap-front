import * as L from 'leaflet';
import { LeafletMouseEvent, Map, Popup, popup } from 'leaflet';
import { MapApi } from 'src/modules/api/classes/map.api';

export const buildWmsCQLFilter = (v: any) => {
  let wmsCQLFilter = '';
  wmsCQLFilter = '';
  if (v.region) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'rgn=' + v.region;
  }
  if (v.district) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'dst=' + v.district;
  }
  if (v.conton) {
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    wmsCQLFilter += 'cntn=' + v.conton;
  }
  if (v.culture) {
    const val = v.culture;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    if (typeof val === 'string' && val.split(',').length > 1) {
      wmsCQLFilter += `clt in (${val})`;
    } else {
      wmsCQLFilter += 'clt=' + v.culture;
    }
  }
  if (v.land_type) {
    const val = v.land_type;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }
    if (typeof val === 'string' && val.split(',').length > 1) {
      wmsCQLFilter += `ltype in (${val})`;
    } else {
      wmsCQLFilter += 'ltype=' + v.land_type;
    }
  }
  if (v.year) {
    const val = v.year;
    if (wmsCQLFilter.length > 0) {
      wmsCQLFilter += '&&';
    }

    wmsCQLFilter += 'year=' + val;
  }
  return wmsCQLFilter;
};

export const buildWmsPopup = async ({
  event: e,
  mapControlLayersSwitch,
  map,
  mapApi,
}: {
  event: LeafletMouseEvent;
  mapControlLayersSwitch: Record<string, any>;
  map: Map;
  mapApi: MapApi;
}) => {
  let wmsLayerInfoPopup: Popup | null = null;
  const contolLayers = Object.values({
    ...mapControlLayersSwitch,
  });
  const activeControlLayer = [...contolLayers]
    .sort((a, b) => b?.updatedAt - a?.updatedAt)
    .filter((item) => item?.name && item?.updatedAt && item?.layersName)?.[0];

  if (activeControlLayer != null) {
    const layers = activeControlLayer?.layersName;
    if (layers == null) return;

    const { lat, lng } = e.latlng;
    const bbox = [lng - 0.1, lat - 0.1, lng + 0.1, lat + 0.1];

    try {
      let data: any = null;
      if (layers.includes('agromap')) {
        data = await mapApi.getFeatureInfo({
          bbox: bbox.join(','),
          layers: layers,
          query_layers: layers,
        });
      }

      const properties: any = data.features?.[0]?.properties;

      if (map && properties != null) {
        const tooltipContent = `
        <div>
          ${Object.entries(properties)
            .map(([key, value]) => {
              if (
                value &&
                (typeof value === typeof '' || typeof value === typeof 0)
              ) {
                return `<p><strong>${key}:</strong>  ${value}</p> `;
              }
              return null;
            })
            .filter(Boolean)
            .join('<hr>')}
        </div>
      `;

        const options = { maxHeight: 300, maxWidth: 300 };
        wmsLayerInfoPopup = popup(options)
          .setLatLng(e.latlng)
          .setContent(tooltipContent)
          .openOn(map);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return wmsLayerInfoPopup;
};

export const buildSplashScreen = () => {
  var svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('viewBox', '0 0 200 200');
  svgElement.innerHTML = '<rect width="200" height="200"/>';

  var latLngBounds = L.latLngBounds(L.latLng(50.0, 60.0), L.latLng(30.0, 90.0));

  return L.svgOverlay(svgElement, latLngBounds, {
    opacity: 0.6,
    interactive: false,
  });
};
