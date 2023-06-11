import * as THREE from "three";
import { IBox, IVueCustomScrollbar, IPackedBox } from "~/types";

export interface IArea {
  value: number;
  rowIndex: number;
  rowCount: number;
  columnIndex: number;
  columnCount: number;
}

export interface IIndex{
  isVariants: Boolean;
  activeVariant: string;
  isPersentage: Boolean;
  middles: {
    midH: number;
    midW: number;
    midL: number;
    midWeight: number;
  };
  maximums: {
    maxH: number;
    maxW: number;
    maxL: number;
    maxWeight: number;
  };
  variant: IBox | IBox[] | null;
  currentItems: IBox[];
  currentBoxes: IBox[];
  persentage: number;
  totalWeight: number;
  totalVolume: number;
  sameVolumes: IBox[];
  upperVolumes: IBox[];
  equalsVolumes: IBox[][];
  combineVolumes: IBox[];
}

export interface IItemsTypes {
  filter: string | null;
  currentItems: IBox[];
  settings: IVueCustomScrollbar;
}

export default {};
