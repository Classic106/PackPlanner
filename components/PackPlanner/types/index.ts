import * as THREE from "three";
import { IBox, IVueCustomScrollbar, IPackedBox } from "~/types";

export interface IIndexTypes {
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

export interface IPlannerVisualTypes {
  autoPack: Boolean;
  nextItem: Boolean;
  canvas: HTMLCanvasElement | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  view1Elem: HTMLElement | null;
  scale: number;
  packedItems: IPackedBox[];
  floorPlaneSize: number;
  currentItems: IPackedBox[];
  copiedItems: IPackedBox[];
  boxUuids: string[];
  itemsUuids: string[];
  boxesData: {
    [key: string]: {
      volume: number[][];
      height: number;
    };
  };
  boxFilled: string[];
}

export default {};
