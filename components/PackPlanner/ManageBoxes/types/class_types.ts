import * as THREE from "three";
import { IBox, IPackedBox } from "~/types";
import { IArea } from "../../types";
import { IScaledPack, IPosition, IRotate, IScaledBox, IMesh } from "./types";

export abstract class IScene {
  canvas: HTMLCanvasElement | null;
  view1Elem: HTMLElement | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  floorPlaneSize: number;

  constructor(canvas: HTMLCanvasElement, view1Elem: HTMLElement) {
    this.canvas = canvas;
    this.view1Elem = view1Elem;
    this.floorPlaneSize = 40;
    this.renderer = null;
    this.camera = null;
    this.scene = null;
  }

  addLight(): void {}
  addCamera(): void {}
  addControlls(): void {}
  addScene(): void {}
  addFloorPlane(): void {}
  resizeRendererToDisplaySize(): void {}
  render(): void {}
  addRenderer(): void {}
  init(): void {}
}

export abstract class IManageBox {
  boxUuids: string[];
  itemsUuids: string[];
  scene: THREE.Scene | null;
  boxesData: {
    [key: string]: {
      volume: number[][];
      height: number;
    };
  };
  scale: number;

  constructor(canvas: HTMLCanvasElement, view1Elem: HTMLElement) {
    this.boxUuids = [];
    this.itemsUuids = [];
    this.boxesData = {};
    this.scene = null;
    this.scale = 1;
  }

  positionByIndex(index: number, w: number, l: number): IPosition | null {
    return null;
  }
  rotate(mesh: IMesh, rotate: IRotate): IMesh {
    return mesh;
  }
  position(mesh: IMesh, position: IPosition): IMesh {
    return mesh;
  }
  fillBox(boxUuid: string, area: IArea, item: IScaledPack): void {}
  addPlane(
    w: number,
    l: number,
    position?: IPosition | null,
    rotate?: IRotate | null,
    edge?: string | number
  ): IMesh {
    return {} as IMesh;
  }
  addBox(box: IBox, index?: number): void {}
  addPack(pack: IScaledPack, area: IArea, boxUuid: string): void {}
  initBox(box: IBox): IScaledBox {
    return box as IScaledBox;
  }
  initPack(pack: IPackedBox) {
    return pack as IScaledPack;
  }
  sortByVolume(a: IBox | IPackedBox, b: IBox | IPackedBox): number {
    return 0;
  }
  colorParse(color: string): number {
    return 0;
  }
  scaleSizes(w: number, l: number, h: number) {
    return { ws: 0, ls: 0, hs: 0 };
  }
  clearAllPacks(): void {}
  clearAllBoxesData(): void {}
  clearAllBoxes(): void {}
}

export default { IScene, IManageBox };
