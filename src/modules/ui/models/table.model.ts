export type ITableItem = Record<string, string | number>;

export interface ITableField {
  title: string;
  field: string;
}

export interface ITableAction {
  type: string;
  item: ITableItem;
}
