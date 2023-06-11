import { IBox, IPackedBox } from "~/types";

export interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}

export interface IRotate extends IPosition {}
export interface IScaledBox extends IBox {
  w: number;
  l: number;
  h: number;
}

export interface IScaledPack extends IPackedBox {
  w: number;
  l: number;
  h: number;
}

export type IMesh =
  | THREE.LineSegments<
      THREE.EdgesGeometry<THREE.PlaneGeometry>,
      THREE.LineBasicMaterial
    >
  | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhongMaterial>
  | THREE.Group;

export default {};
