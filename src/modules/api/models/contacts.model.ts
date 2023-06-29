export interface IDepartment {
  id: string;
  name: string;
}

export interface IContactInformation {
  id: number;
  title: string;
  fullname: string;
  address: string;
  phone: string;
  mail: string;
  point: IPoint;
  department: IDepartment;
  district: IDistrict;
}

export interface IPoint {
  type: string;
  coordinates: number[];
}

export interface IDistrict {
  id: number;
  name: string;
  region: {
    id: number;
    name: string;
  };
}
