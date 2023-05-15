export type ITableItem = Record<string, string | number>;

export interface ITableField {
  title: string;
  field: string;
  rowspan?: number;
  colspan?: number;
  mobileTitle?: string;
}

export interface ITableAction {
  type: string;
  item: ITableItem;
}
