export interface IVueCustomScrollbar {
  suppressScrollX: Boolean;
  wheelPropagation: Boolean;
}

export enum EDimension {
  cm = "cm",
  inch = "inch",
}

export enum EWeight_dimension {
  kilo = "kilo",
  lbs = "lbs",
}

export interface IBox {
  id?: string;
  height: number;
  width: number;
  lengthy: number;
  weight: number;
  volume: number;
  dimension: EDimension;
  weight_dimension: EWeight_dimension;
  color?: number | string;
}

export interface IPackedBox extends IBox {
  packed: Boolean;
}
