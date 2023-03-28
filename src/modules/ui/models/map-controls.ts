export interface IBaseLayerObject {
  name: string;
  layer: L.TileLayer;
}

export interface IWmsLayerObject {
  name: string;
  layers: string;
  active: boolean;
}
