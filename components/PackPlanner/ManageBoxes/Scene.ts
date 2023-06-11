import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { IScene } from "./types/class_types";

export default class Scene extends IScene {
  constructor(canvas: HTMLCanvasElement, view1Elem: HTMLElement) {
    super(canvas, view1Elem);
    this.canvas = canvas;
    this.view1Elem = view1Elem;

    if (view1Elem && canvas) {
      this.init();
      this.render();
    }
  }

  addLight() {
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
  }
  addCamera() {
    const fov = 45;
    const aspect = 2; // the canvas default
    const near = 5;
    const far = 100;

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 10, 20);
  }
  addControlls() {
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
  }
  addScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("grey");
  }
  addFloorPlane() {
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
  }
  resizeRendererToDisplaySize() {
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
  }
  render() {
    const { renderer, camera, scene } = this;

    this.resizeRendererToDisplaySize();

    if (this && renderer && scene && camera) {
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      requestAnimationFrame(this.render.bind(this));
    }
  }
  addRenderer() {
    const { canvas } = this;
    if (canvas) {
      this.renderer = new THREE.WebGLRenderer({ canvas });
    }
  }
  init() {
    this.addRenderer();
    this.addCamera();
    this.addControlls();
    this.addScene();

    this.addFloorPlane();
    this.addLight();
  }
}
