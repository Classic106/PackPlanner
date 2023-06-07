<template>
  <div>
    <div class="row m-0">
      <div class="d-flex col-10 position-relative mb-4 pr-2 p-0">
        <canvas ref="canvas"></canvas>
        <div class="split">
          <div ref="view1"></div>
        </div>
      </div>
      <div class="col-2 p-0 pr-2">
        <Items :items="packedItems" />
      </div>
    </div>
    <div class="d-flex justify-content-end">
      <button
        class="btn mr-1"
        :class="autoPack ? 'btn-primary' : 'btn-danger'"
        v-on:click="autoPack = !autoPack"
      >
        Auto pack
      </button>
      <button
        class="btn btn-warning mr-1"
        :disabled="autoPack"
        v-on:click="reset"
      >
        Reset
      </button>
      <button
        class="btn btn-primary"
        :disabled="autoPack"
        v-on:click="nextItem = !nextItem"
      >
        Next item
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { PropType } from "vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { IBox, IPackedBox } from "~/types";
import { IArea, ICube, IPosition, IRotate, IScaledBox } from "./types";

import { IPlannerVisualTypes } from "../types";
import { convertSizes } from "~/utils/functions";
import isDarkColor from "is-dark-color";

import Items from "../Items.vue";

export default Vue.extend({
  name: "PlannerVisual",
  props: {
    variant: [Object, Array, null] as PropType<IBox | IBox[] | null>,
    items: Array as PropType<IPackedBox[]>,
  },
  components: { Items },
  data: (): IPlannerVisualTypes => ({
    autoPack: true,
    nextItem: false,
    canvas: null,
    renderer: null,
    camera: null,
    scene: null,
    view1Elem: null,
    scale: 1, //1 full size, number < 1 less sizes
    packedItems: [],
    floorPlaneSize: 40,
    currentItems: [],
    copiedItems: [],
    boxUuids: [],
    itemsUuids: [],
    boxesData: {},
    boxFilled: [],
  }),
  watch: {
    autoPack: function () {
      this.clearAllItems();
      this.initBoxes();
      this.initItems();
      // this.packItems();

      if (this.autoPack) {
        this.packItems();
      } else {
        this.reset();
      }
    },
    nextItem: function () {
      if (this.boxFilled.length) {
        const boxes = [...this.boxUuids].filter(
          (box) => !this.boxFilled.includes(box)
        );

        if (boxes.length) {
          this.packBox(boxes[0]);
        }
      } else {
        this.packBox(this.boxUuids[0]);
      }
    },
    currentItems: {
      handler() {
        this.initPackedItems();
      },
      deep: true,
    },
    variant: function () {
      this.clearAllItems();
      this.setCurrentItems();
      this.initBoxes();
      this.packItems();
    },
    items: function () {
      this.initBoxes();
      this.initItems();
      this.packItems();
    },
  },
  methods: {
    isDarkColor,
    convertSizes,
    colorParse: function (color: string) {
      return parseInt(color.replace("#", "0x"), 16);
    },
    scaleSizes: function (w: number, l: number, h: number) {
      const ws = Math.ceil(w * this.scale) || 0;
      const hs = Math.ceil(h * this.scale) || 0;
      const ls = Math.ceil(l * this.scale) || 0;

      return { ws, ls, hs };
    },
    positionByIndex: function (index: number, w: number, l: number) {
      if (!Array.isArray(this.variant)) {
        return;
      }

      const { length } = this.variant;
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

      return result as IPosition;
    },
    rotate: function (
      mesh:
        | THREE.LineSegments<
            THREE.EdgesGeometry<THREE.PlaneGeometry>,
            THREE.LineBasicMaterial
          >
        | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhongMaterial>
        | THREE.Group,
      rotate: IRotate
    ) {
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
    },
    position: function (
      mesh:
        | THREE.LineSegments<
            THREE.EdgesGeometry<THREE.PlaneGeometry>,
            THREE.LineBasicMaterial
          >
        | THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhongMaterial>
        | THREE.Group,
      position: IPosition
    ) {
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
    },
    packBox: function (boxUuid: string) {
      const { itemForArea, currentItems } = this;

      if (!currentItems.length) {
        return;
      }

      const { volume, height } = this.boxesData[boxUuid];
      const widthAreas = this.findWidthSquare(volume);
      const lengthAreas = this.findLengthSquare(volume);
      const current_Items_length = this.currentItems.length;

      const width_result = itemInArea(widthAreas);
      const length_result = itemInArea(lengthAreas);

      if (width_result && length_result) {
        const {
          area: width_area,
          cube: width_cube,
          item_index: width_item_index,
        } = width_result;
        const {
          area: length_area,
          cube: length_cube,
          item_index: length_item_index,
        } = length_result;

        const width_value = width_area.value;
        const length_value = length_area.value;

        if (width_value < length_value) {
          this.currentItems.splice(length_item_index, 1);
          this.fillBox(boxUuid, length_area, length_cube);
          this.addCube(length_cube, length_area, boxUuid);
        } else {
          this.currentItems.splice(width_item_index, 1);
          this.fillBox(boxUuid, width_area, width_cube);
          this.addCube(width_cube, width_area, boxUuid);
        }
      } else if (width_result) {
        const { area, cube, item_index } = width_result;

        this.currentItems.splice(item_index, 1);
        this.fillBox(boxUuid, area, cube);
        this.addCube(cube, area, boxUuid);
      } else if (length_result) {
        const { area, cube, item_index } = length_result;

        this.currentItems.splice(item_index, 1);
        this.fillBox(boxUuid, area, cube);
        this.addCube(cube, area, boxUuid);
      }

      if (
        this.currentItems.length &&
        this.currentItems.length === current_Items_length
      ) {
        if (!this.autoPack && this.boxUuids.length) {
          this.nextItem = !this.nextItem;
        }

        this.boxFilled.push(boxUuid);
        return;
      }

      if (this.autoPack) {
        if (
          this.currentItems.length &&
          this.currentItems.length < current_Items_length
        ) {
          this.packBox(boxUuid);
          return;
        }
      }

      function itemInArea(areas: IArea[]) {
        const free_areas = [] as IArea[];

        areas
          .filter((area) => area.value < height)
          .map((area) => {
            const { value, rowIndex, rowCount, columnIndex, columnCount } =
              area;
            const result = areas.filter((a) => {
              return (
                a.value === value &&
                a.rowIndex === rowIndex &&
                a.rowCount === rowCount &&
                a.columnIndex === columnIndex &&
                a.columnCount === columnCount
              );
            });

            if (!result.length) {
              areas.push(area);
            }
          });

        free_areas.sort((a, b) => {
          const { value: val_A, columnCount: colC_A, rowCount: rowC_A } = a;
          const { value: val_B, columnCount: colC_B, rowCount: rowC_B } = b;

          const square_A = colC_A * rowC_A;
          const square_B = colC_B * rowC_B;

          if (val_A < val_B && square_A < square_B) {
            return -1;
          } else if (val_A > val_B && square_A > square_B) {
            return 1;
          } else {
            if (square_A < square_B) {
              return -1;
            } else if (square_A > square_B) {
              return 1;
            } else {
              return 0;
            }
          }
        });

        let data = null;

        for (let i = 0; i < areas.length; i++) {
          if (!currentItems.length) {
            break;
          }

          for (let j = 0; j < currentItems.length; j++) {
            const item = currentItems[j];
            const area = areas[i];
            const cube = itemForArea(item, area, height);

            if (cube) {
              data = { cube, item_index: j, area };
              break;
            }
          }
        }
        return data;
      }
    },
    fillBox: function (boxUuid: string, area: IArea, item: ICube) {
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
    },
    packItems: function () {
      const a = Object.entries(this.boxesData);

      for (const [key, value] of Object.entries(this.boxesData)) {
        if (!this.currentItems.length) {
          break;
        }
        this.packBox(key);
      }
    },
    itemForArea: function (
      item: IPackedBox,
      area: IArea,
      boxHeight: number
    ): ICube | null {
      const { width, lengthy, height, color } = item;
      const { value, rowCount, columnCount } = area;
      const { ws, ls, hs } = this.scaleSizes(width, lengthy, height);

      const areaLenght = columnCount + 1;
      const areaWidth = rowCount + 1;

      const checkValues_lenghtAsHeight =
        value + ls <= boxHeight && areaLenght >= hs && areaWidth >= ws;

      if (checkValues_lenghtAsHeight) {
        return { w: ws, l: hs, h: ls, color };
      }

      const checkValues_widthAsHeight =
        value + ws <= boxHeight && areaLenght >= ls && areaWidth >= hs;

      if (checkValues_widthAsHeight) {
        return { w: hs, l: ls, h: ws, color };
      }

      const checkValue_widthAsLenght =
        value + hs <= boxHeight && areaLenght >= ws && areaWidth >= ls;

      if (checkValue_widthAsLenght) {
        return { w: ls, l: ws, h: hs, color };
      }

      const checkValues_widthAsHeight_heightAsLenght =
        value + ws <= boxHeight && areaLenght >= hs && areaWidth >= ls;

      if (checkValues_widthAsHeight_heightAsLenght) {
        return { w: ls, l: hs, h: ws, color };
      }

      const checkValues_lenghtAsHeight_heightAsWidth =
        value + ls <= boxHeight && areaLenght >= ws && areaWidth >= hs;

      if (checkValues_lenghtAsHeight_heightAsWidth) {
        return { w: hs, l: ws, h: ls, color };
      }

      const checkValues_same =
        value + hs <= boxHeight && areaLenght >= ls && areaWidth >= ws;

      if (checkValues_same) {
        return { w: ws, l: ls, h: hs, color };
      }

      return null;
    },
    findLengthSquare: function (box: number[][]) {
      const squares = [] as IArea[];
      let temp = {
        value: 0,
        rowCount: 0,
        rowIndex: 0,
        columnCount: 0,
        columnIndex: 0,
      } as IArea;
      const columns = [] as IArea[];

      for (let i = 0; i < box[0].length; i++) {
        for (let j = 1; j < box.length; j++) {
          const colValPr = box[j - 1][i];
          const colValNext = box[j][i];

          if (colValPr === colValNext) {
            temp.value = colValNext;
            temp.columnCount++;
            temp.rowIndex = i;

            if (!columns.length) {
              columns.push({ ...temp });
            } else {
              columns[columns.length - 1].columnCount++;
            }
          } else {
            temp.value = colValNext;
            temp.rowIndex = i;
            temp.columnCount = 0;
            temp.columnIndex = j;

            columns.push({ ...temp });
          }
        }

        if (!squares.length && columns.length) {
          columns.map((column) => squares.push(column));

          columns.length = 0;
          temp.columnCount = 0;
          temp.columnIndex = 0;
          continue;
        }

        if (squares.length) {
          columns.map((column) => {
            const index = squares.findIndex((sq) => {
              const { value, rowIndex, rowCount, columnIndex, columnCount } =
                sq;

              const isValue = value === column.value;
              const isColumn = columnIndex === column.columnIndex;
              const isColumnCount = columnCount === column.columnCount;
              const isRow =
                rowIndex + rowCount + 1 === column.rowIndex ||
                rowIndex === column.rowIndex;

              return isValue && isColumnCount && isRow && isColumn;
            });

            if (index !== -1) {
              squares[index].rowCount++;
            } else {
              squares.push(column);
            }
          });
        }
        columns.length = 0;
        temp.columnCount = 0;
        temp.columnIndex = 0;
      }

      return squares;
    },
    findWidthSquare: function (box: number[][]) {
      const squares = [] as IArea[];
      let temp = {
        value: 0,
        rowCount: 0,
        rowIndex: 0,
        columnCount: 0,
        columnIndex: 0,
      };
      const lines = [];

      for (let i = 0; i < box.length; i++) {
        for (let j = 1; j < box[i].length; j++) {
          const valuePr = box[i][j - 1];
          const valueNext = box[i][j];

          if (valuePr === valueNext) {
            temp.rowCount++;
            temp.value = valueNext;
            temp.columnIndex = i;

            if (!lines.length) {
              lines.push({ ...temp });
            } else {
              lines[lines.length - 1].rowCount++;
            }
          } else {
            temp.rowCount = 0;
            temp.value = valueNext;
            temp.rowIndex = j;
            temp.columnIndex = i;

            lines.push({ ...temp });
          }
        }

        if (!squares.length && lines.length) {
          lines.map((line) => squares.push(line));
          temp = {
            value: 0,
            rowCount: 0,
            rowIndex: 0,
            columnCount: 0,
            columnIndex: 0,
          };
          lines.length = 0;
          continue;
        }

        if (squares.length) {
          lines.map((line) => {
            const index = squares.findIndex((sq) => {
              const { value, rowIndex, rowCount, columnIndex, columnCount } =
                sq;

              const isValue = value === line.value;
              const isRow = rowIndex === line.rowIndex;
              const isRowCount = rowCount === line.rowCount;
              const isColumn =
                columnIndex + columnCount + 1 === line.columnIndex ||
                columnIndex === line.columnIndex;

              return isValue && isRowCount && isRow && isColumn;
            });

            if (index !== -1) {
              squares[index].columnCount++;
            } else {
              squares.push(line);
            }
          });
        }

        lines.length = 0;
        temp = {
          value: 0,
          rowCount: 0,
          rowIndex: 0,
          columnCount: 0,
          columnIndex: 0,
        };
      }

      return squares;
    },
    addBox: function ({ w, l, h, color }: IScaledBox, position?: IPosition) {
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
        floorBorder.material.color.setHex(color as number);

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
    },
    addPlane: function (
      w: number,
      l: number,
      position: IPosition | null,
      rotate: IRotate | null,
      edge?: number | string
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
    },
    addFloorPlane: function () {
      if (this.scene) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
          "https://threejsfundamentals.org/threejs/resources/images/checker.png"
        );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = this.floorPlaneSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(
          this.floorPlaneSize,
          this.floorPlaneSize
        );
        const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -0.5;
        this.scene.add(mesh);
      }
    },
    addCube: function (item: ICube, area: IArea, boxUuid: string) {
      const { w, l, h, color } = item;

      if (this.scene) {
        const box = this.scene.getObjectByProperty("uuid", boxUuid);

        if (box) {
          const boxWidth = this.boxesData[boxUuid].volume[0].length;
          const boxLength = this.boxesData[boxUuid].volume.length;

          const isDark = this.isDarkColor(color);

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
        }
      }
    },
    addLight: function () {
      if (this.scene) {
        const color = 0xffffff;

        const hemiLight = new THREE.HemisphereLight(color, 0x444444);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(color, 0.5);
        dirLight.position.set(3, 10, 10);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = -2;
        dirLight.shadow.camera.left = -2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;

        this.scene.add(dirLight);
      }
    },
    addCamera: function () {
      this.view1Elem = this.$refs.view1 as HTMLInputElement;
      const fov = 45;
      const aspect = 2; // the canvas default
      const near = 5;
      const far = 100;

      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.set(0, 10, 20);
    },
    addControlls: function () {
      const { camera, view1Elem } = this;

      if (view1Elem && camera) {
        const controls = new OrbitControls(camera, view1Elem);
        // comment 4 below lines for rotate scene in all directions
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 15;
        controls.maxDistance = 40;
        // comment 4 above lines for rotate scene in all directions
        controls.target.set(0, 5, 0);
        controls.update();
      }
    },
    addScene: function () {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color("grey");
    },
    resizeRendererToDisplaySize: function () {
      const { renderer } = this;

      if (renderer) {
        this.canvas = renderer.domElement;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        const needResize =
          this.canvas.width !== width || this.canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }
    },
    render: function () {
      const { renderer, camera, scene } = this;
      this.resizeRendererToDisplaySize();

      if (renderer && scene && camera) {
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        requestAnimationFrame(this.render);
      }
    },
    addRenderer: function () {
      this.canvas = this.$refs.canvas as HTMLCanvasElement;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    },
    initBoxes: function () {
      if (!this.variant) {
        return;
      }

      const { convertSizes, scaleSizes, addBox, positionByIndex } = this;

      //remove old boxes
      this.boxUuids.map((uuid) => {
        if (this.scene) {
          const object = this.scene.getObjectByProperty("uuid", uuid);
          if (object) {
            object.clear();
            object.removeFromParent();
            delete this.boxesData[uuid];
          }
        }
      });

      this.boxUuids = [];

      if (!Array.isArray(this.variant)) {
        initBox(this.variant);
      } else {
        this.variant.map((v, index) => initBox(v, index));
      }

      function checkColor(color: string) {
        if (!color) {
          const col = THREE.MathUtils.randInt(0, 0xffffff);
          const c = new THREE.Color().set(col).getHexString();
          return `0x${c}`;
        }
        return color;
      }

      function initBox(box: IBox, index?: number) {
        const { width, lengthy, height, color } = convertSizes(box);
        const { ws, ls } = scaleSizes(width, lengthy, height);

        const boxHeight = Math.floor(height);
        const pos =
          typeof index === "number"
            ? positionByIndex(index, ws, ls)
            : undefined;

        const currentColor = checkColor(color as string);
        const changes = {
          color: currentColor,
          w: ws,
          l: ls,
          h: boxHeight,
        };

        const newItem = { ...box, ...changes } as IScaledBox;

        addBox(newItem, pos);
      }
    },
    clearAllItems: function () {
      //remove items cubicles
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
    },
    init: function () {
      this.addRenderer();
      this.addCamera();
      this.addControlls();
      this.addScene();

      this.addFloorPlane();
      this.addLight();
    },
    initItems: function () {
      const copiedItems = [...this.items]
        .map((item) => {
          const newItem = { ...item };
          const { color } = newItem;

          if (!color) {
            const col = THREE.MathUtils.randInt(0, 0xffffff);
            const colorValue = new THREE.Color().set(col).getHexString();
            newItem.color = `#${colorValue}`;
          }
          newItem.packed = false;

          return this.convertSizes(newItem);
        })
        .sort(this.sortByVolume);

      this.copiedItems = copiedItems as IPackedBox[];
      this.setCurrentItems();
    },
    setCurrentItems: function () {
      this.currentItems = [...this.copiedItems];
    },
    sortByVolume: function (a: IBox, b: IBox) {
      if (a.volume > b.volume) {
        return -1;
      }
      if (a.volume < b.volume) {
        return 1;
      }
      return 0;
    },
    reset: function () {
      if (!this.autoPack) {
        this.clearAllItems();
        this.initBoxes();
        this.initItems();
        this.boxFilled = [];
      }
    },
    initPackedItems: function () {
      const ids = this.currentItems.map((item) => item.id);

      this.packedItems = [...this.copiedItems].map((item) => {
        const { id } = item;
        const isExist = ids.includes(id);

        item.packed = !isExist;

        return item;
      });
    },
  },
  mounted() {
    this.init();
    this.render();
    this.initItems();
    this.initBoxes();
    this.packItems();
  },
});
</script>

<style scoped>
canvas {
  width: 100%;
  height: 50vh;
  display: block;
}

.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}

.split > div {
  width: 100%;
  height: 100%;
}
</style>