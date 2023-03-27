export interface IBaseLyaerObject {
    name: string;
    layer: L.TileLayer;
}
  
export interface IWmsLayersObject {
    name: string;
    layers: string;
    active: boolean;
}