import * as THREE from "three";
import isDarkColor from "is-dark-color";

import { IBox, IPackedBox } from "~/types";
import { IManageBox } from "./types/class_types";
import { IArea } from "../types";
import {
  IScaledPack,
  IPosition,
  IRotate,
  IScaledBox,
  IMesh,
} from "./types/types";

import Scene from "./Scene";

export default class ManageBoxes extends IManageBox {
  constructor(canvas: HTMLCanvasElement, view1Elem: HTMLElement) {
    super(canvas, view1Elem);
    if (view1Elem && canvas) {
      const scene = new Scene(canvas, view1Elem);
      this.scene = scene.scene;
    }
  }

  positionByIndex(index: number, w: number, l: number) {
    let result = null;

    if (length === 2) {
      switch (index) {
        case 0:
          result = {
            x: -(w + this.scale) + (w / 2) * this.scale,
          };
          break;
        case 1:
          result = {
            x: w + this.scale - (w / 2) * this.scale,
          };
          break;
      }
    }

    if (length === 3) {
      switch (index) {
        case 0:
          result = {
            x: -(w + this.scale) + (w / 2) * this.scale,
            z: l + this.scale - (l / 2) * this.scale,
          };
          break;
        case 1:
          result = {
            x: w + this.scale - (w / 2) * this.scale,
            z: l + this.scale - (l / 2) * this.scale,
          };
          break;
        case 2:
          result = {
            z: -(l + this.scale) + (l / 2) * this.scale,
          };
          break;
      }
    }

    if (length === 4) {
      switch (index) {
        case 0:
          result = {
            x: -(w + this.scale) + (w / 2) * this.scale,
            z: -(l + this.scale) + (l / 2) * this.scale,
          };
          break;
        case 1:
          result = {
            x: w + this.scale - (w / 2) * this.scale,
            z: -(l + this.scale) + (l / 2) * this.scale,
          };
          break;
        case 2:
          result = {
            x: -(w + this.scale) + (w / 2) * this.scale,
            z: l + this.scale - (l / 2) * this.scale,
          };
          break;
        case 3:
          result = {
            x: w + this.scale - (w / 2) * this.scale,
            z: l + this.scale - (l / 2) * this.scale,
          };
          break;
      }
    }

    return result;
  }
  rotate(mesh: IMesh, rotate: IRotate) {
    const { x, y, z } = rotate;

    if (x) {
      mesh.rotation.x = x;
    }
    if (y) {
      mesh.rotation.y = y;
    }
    if (z) {
      mesh.rotation.z = z;
    }
    return mesh;
  }
  position(mesh: IMesh, position: IPosition) {
    const { x, y, z } = position;

    if (x) {
      mesh.position.x = x;
    }
    if (y) {
      mesh.position.y = y;
    }
    if (z) {
      mesh.position.z = z;
    }
    return mesh;
  }
  fillBox(boxUuid: string, area: IArea, item: IScaledPack) {
    const { value, rowIndex, columnIndex } = area;
    const { w, l, h } = item;

    const rowTo = rowIndex + w;
    const columnTo = columnIndex + l;
    const height = value + h;

    for (let i = columnIndex; i < columnTo; i++) {
      for (let j = rowIndex; j < rowTo; j++) {
        this.boxesData[boxUuid].volume[i][j] = height;
      }
    }
  }
  addPlane(
    w: number,
    l: number,
    position?: IPosition | null,
    rotate?: IRotate | null,
    edge?: string | number
  ) {
    const planeGeo = new THREE.PlaneGeometry(w, l);
    let mesh = null;

    if (edge) {
      const color = +edge || 0xff9a00;
      const edges = new THREE.EdgesGeometry(planeGeo);
      mesh = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color })
      );
    } else {
      const planeMat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(planeGeo, planeMat);
    }

    if (rotate) {
      this.rotate(mesh, rotate);
    }
    if (position) {
      this.position(mesh, position);
    }
    return mesh;
  }
  addBox(box: IBox, index?: number) {
    const { w, l, h, color } = this.initBox(box);
    this.boxesData

    const position = index && this.positionByIndex(index, w, l);

    if (this.scene) {
      const group = new THREE.Group();

      const frontPosition = { z: l / 2, y: h / 2 };
      const backPosition = { z: -l / 2, y: h / 2 };
      const rightPosition = { x: w / 2, y: h / 2 };
      const leftPosition = { x: -w / 2, y: h / 2 };
      const floorPosition = { y: 0 };

      const leftRightRotate = { y: Math.PI * 0.5 };
      const floorRotate = { x: Math.PI * 0.5 };

      const frontBorder = this.addPlane(w, h, frontPosition, null, color);
      const backBorder = this.addPlane(w, h, backPosition, null, color);
      const rightBorder = this.addPlane(
        l,
        h,
        rightPosition,
        leftRightRotate,
        color
      );
      const leftBorder = this.addPlane(
        l,
        h,
        leftPosition,
        leftRightRotate,
        color
      );
      const floorBorder = this.addPlane(w, l, floorPosition, floorRotate);
      if (color) {
        floorBorder.material.color.setHex(color as number);
      }
      group.add(frontBorder);
      group.add(backBorder);
      group.add(rightBorder);
      group.add(leftBorder);
      group.add(floorBorder);

      if (position) {
        const pos = { y: 0.05 };
        this.position(group, { ...position, ...pos });
      }

      group.position.y = 0.05;
      const { uuid } = group;

      const volume = new Array(Math.ceil(l));
      for (var i = 0; i < l; i++) {
        volume[i] = new Array(w).fill(0);
      }

      this.boxesData[uuid] = {
        volume,
        height: h,
      };

      this.boxUuids.push(uuid);
      this.scene.add(group);
    }
  }
  addPack(pack: IScaledPack, area: IArea, boxUuid: string) {
    this.fillBox(boxUuid, area, pack);

    const { w, l, h, color } = pack;

    if (this.scene) {
      const box = this.scene.getObjectByProperty("uuid", boxUuid);

      if (box) {
        const boxWidth = this.boxesData[boxUuid].volume[0].length;
        const boxLength = this.boxesData[boxUuid].volume.length;

        const isDark = isDarkColor(color);

        const cubeGeo = new THREE.BoxGeometry(w, h, l);
        const cubeMat = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);

        const geo = new THREE.EdgesGeometry(mesh.geometry);
        const mat = new THREE.LineBasicMaterial({
          color: isDark ? 0xffffff : 0x000000,
        });
        const wireframe = new THREE.LineSegments(geo, mat);

        mesh.add(wireframe);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        if (area) {
          const { value, columnIndex, rowIndex } = area;

          const x = -boxWidth / 2 + w / 2 + rowIndex;
          const y = h / 2 + value;
          const z = -boxLength / 2 + l / 2 + columnIndex;

          this.position(mesh, { x, y, z });
        } else {
          const y = h / 2;
          this.position(mesh, { y });
        }

        const { uuid } = mesh;
        this.itemsUuids.push(uuid);

        box.add(mesh);
        this.scene.add(box);
      }
    }
  }
  initBox(box: IBox | IPackedBox): IScaledBox {
    const { width, lengthy, height, color } = box;
    const { ws, ls } = this.scaleSizes(width, lengthy, height);

    const boxHeight = Math.floor(height);

    const currentColor = checkColor(color);
    const changes = {
      color: currentColor,
      w: ws,
      l: ls,
      h: boxHeight,
    };

    return { ...box, ...changes };

    function checkColor(color: number | string | undefined) {
      if (!color) {
        const col = THREE.MathUtils.randInt(0, 0xffffff);
        const c = new THREE.Color().set(col).getHexString();
        return `0x${c}`;
      }
      return color;
    }
  }
  initPack(pack: IPackedBox) {
    const newPack = { ...pack };
    const { width, lengthy, height, color } = pack;
    const { ws, ls, hs } = this.scaleSizes(width, lengthy, height);

    if (!color) {
      const col = THREE.MathUtils.randInt(0, 0xffffff);
      const colorValue = new THREE.Color().set(col).getHexString();
      newPack.color = `#${colorValue}`;
    }
    newPack.packed = false;

    return { ...newPack, w: ws, l: ls, h: hs };
  }
  sortByVolume(a: IBox | IPackedBox, b: IBox | IPackedBox) {
    if (a.volume > b.volume) {
      return -1;
    }
    if (a.volume < b.volume) {
      return 1;
    }
    return 0;
  }
  colorParse(color: string) {
    return parseInt(color.replace("#", "0x"), 16);
  }
  scaleSizes(w: number, l: number, h: number) {
    const ws = Math.ceil(w * this.scale) || 0;
    const hs = Math.ceil(h * this.scale) || 0;
    const ls = Math.ceil(l * this.scale) || 0;

    return { ws, ls, hs };
  }
  clearAllPacks() {
    //remove old packs
    if (this.itemsUuids.length) {
      this.itemsUuids.map((uuid) => {
        if (this.scene) {
          const object = this.scene.getObjectByProperty("uuid", uuid);
          if (object) {
            object.clear();
            object.removeFromParent();
          }
        }
      });
      this.itemsUuids = [];
    }

    this.clearAllBoxesData();
  }
  clearAllBoxesData() {
    for (const [key, value] of Object.entries(this.boxesData)) {
      const width = value.volume.length;
      const length = value.volume[0].length;

      const volume = new Array(width);
      for (var i = 0; i < width; i++) {
        volume[i] = new Array(length).fill(0);
      }
      this.boxesData[key] = { ...this.boxesData[key], volume };
    }
  }
  clearAllBoxes() {
    //remove old boxes
    if (this.boxUuids.length) {
      this.boxUuids.map((uuid) => {
        if (this.scene) {
          const object = this.scene.getObjectByProperty("uuid", uuid);
          if (object) {
            object.clear();
            object.removeFromParent();
          }
        }
      });

      this.boxUuids = [];
      this.boxesData = {};
    }
  }
}
