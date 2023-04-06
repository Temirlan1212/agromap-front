export type ITableItem = Record<string, string | number>;

export interface ITableAction {
  type: string;
  item: ITableItem;
}
