import { IPackedBox } from "~/types";

export interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}

export interface IRotate extends IPosition {}
export interface IScaledBox extends IPackedBox {
  w: number;
  l: number;
  h: number;
}

export interface ICube {
  w: number;
  l: number;
  h: number;
  color?: string | number;
}

export interface IArea {
  value: number;
  rowIndex: number;
  rowCount: number;
  columnIndex: number;
  columnCount: number;
}

export default {};