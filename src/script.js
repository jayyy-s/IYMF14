import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";

/**
 * Debug
 */
const debugObject = {
  theta: 0,
};
const gui = new GUI({ width: 500 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

// Sphere Textures
const sphereAoTexture = textureLoader.load(
  "./textures/floor/metal_0033_ao_1k.jpg"
);
const sphereColorTexture = textureLoader.load(
  "./textures/floor/metal_0033_color_1k.jpg"
);
sphereColorTexture.colorSpace = THREE.SRGBColorSpace;
sphereColorTexture.magFilter = THREE.NearestFilter;
const sphereNormalTexture = textureLoader.load(
  "./textures/floor/metal_0033_normal_opengl_1k.png"
);
const sphereOpacityTexture = textureLoader.load(
  "./textures/floor/metal_0033_opacity_1k.jpg"
);
const sphereRoughnessTexture = textureLoader.load(
  "./textures/floor/metal_0033_roughness_1k.jpg"
);

const sphereS = 6;
const sphereT = 3;

sphereColorTexture.repeat.set(sphereS, sphereT);
sphereColorTexture.wrapS = THREE.RepeatWrapping;
sphereColorTexture.wrapT = THREE.RepeatWrapping;

sphereAoTexture.repeat.set(sphereS, sphereT);
sphereAoTexture.wrapS = THREE.RepeatWrapping;
sphereAoTexture.wrapT = THREE.RepeatWrapping;

sphereOpacityTexture.repeat.set(sphereS, sphereT);
sphereOpacityTexture.wrapS = THREE.RepeatWrapping;
sphereOpacityTexture.wrapT = THREE.RepeatWrapping;

sphereNormalTexture.repeat.set(sphereS, sphereT);
sphereNormalTexture.wrapS = THREE.RepeatWrapping;
sphereNormalTexture.wrapT = THREE.RepeatWrapping;

// Mountain textures
const lichenRockARMTexture = textureLoader.load(
  "./textures/mountain/lichen_rock_1k/lichen_rock_arm_1k.jpg"
);
const lichenRockColorTexture = textureLoader.load(
  "./textures/mountain/lichen_rock_1k/lichen_rock_diff_1k.jpg"
);
lichenRockColorTexture.colorSpace = THREE.SRGBColorSpace;
const lichenRockDisplacementTexture = textureLoader.load(
  "./textures/mountain/mossy_rock_1k/mt_everest_disp.png"
);
const lichenRockNormalTexture = textureLoader.load(
  "./textures/mountain/lichen_rock_1k/lichen_rock_nor_gl_1k.jpg"
);
const lichenRockTextures = [
  lichenRockARMTexture,
  lichenRockColorTexture,
  lichenRockDisplacementTexture,
  lichenRockNormalTexture,
];

lichenRockTextures.map((texture) => {
  texture.repeat.set(1, 0.6);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
});

const alphaMap = textureLoader.load("./textures/sunset/alpha.jpg");

/**
 * Objects
 */
const group = new THREE.Group();

const sphereMaterialOptions = {
  map: sphereColorTexture,
  aoMap: sphereAoTexture,
  normalMap: sphereNormalTexture,
  alphaMap: sphereOpacityTexture,
  transparent: true,
  color: "green",
};

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.005, 64, 32),
  new THREE.MeshStandardMaterial(sphereMaterialOptions)
);
sphere.rotation.z = Math.PI / 2;
gui.add(sphere.rotation, "z").min(-6).max(6).step(0.001);

const innerSphere = new THREE.Mesh(
  new THREE.SphereGeometry(2, 64, 32),
  new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide })
);

const testCube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial()
);
testCube2.position.x = -2;

const testCube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial()
);
testCube3.position.x = 2;

// Sunset
const sunsetPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ map: alphaMap })
);

group.add(sunsetPlane);

// Mountains
const mountains = [];
const mountainMaterial = new THREE.MeshStandardMaterial({
  map: lichenRockColorTexture,
  displacementMap: lichenRockDisplacementTexture,
  displacementScale: 0.7,
  displacementBias: -0.37,
  aoMap: lichenRockARMTexture,
  roughnessMap: lichenRockARMTexture,
  metalnessMap: lichenRockARMTexture,
  normalMap: lichenRockNormalTexture,
});

const mountainPairCount = 8;
const radius = 2;

const angleIncrement = (Math.PI * 2) / mountainPairCount;

const mountainsFolder = gui.addFolder("Mountains Rotation X");
mountainsFolder.close();

const generateMountain = (angle, isLeft) => {
  const mountainX = isLeft ? -0.4 : 0.4;
  const mountainY = Math.cos(angle) * radius;
  const mountainZ = Math.sin(angle) * radius;

  const newMountain = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5, 50, 50),
    mountainMaterial
  );

  newMountain.frustumCulled = false;
  newMountain.position.x = mountainX;
  newMountain.position.y = mountainY;
  newMountain.position.z = mountainZ;

  newMountain.rotation.x = angle - Math.PI / 2;
  newMountain.rotation.z = (Math.random() * Math.PI) / 2;

  return newMountain;
};

// Generate mountains
for (let i = 0; i < mountainPairCount; i++) {
  const angle = angleIncrement * i;

  // TO FIX: Change to XOR implementation
  const bothVisible = Math.random() < 0.33 ? true : false;

  const mountain1 = generateMountain(angle, true);
  mountain1.visible = bothVisible ? true : Math.random() < 0.5 ? true : false;
  mountains.push(mountain1);

  const mountain2 = generateMountain(angle, false);
  mountain2.visible = mountain1.visible
    ? bothVisible
      ? true
      : Math.random() < 0.5
      ? true
      : false
    : true;
  mountains.push(mountain2);

  mountainsFolder
    .add(mountain1.rotation, "x")
    .min(-Math.PI * 2)
    .max(Math.PI * 2)
    .name(`Mountain ${angle}`);
}

group.add(...mountains, innerSphere, sphere);
scene.add(group);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.x = 4;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

/**
 * Sky
 */
// const sky = new Sky();
// sky.scale.set(100, 100, 100);
// scene.add(sky);

// let sun = new THREE.Vector3();

// const effectController = {
//   turbidity: 0,
//   rayleigh: 4,
//   mieCoefficient: 0.014,
//   mieDirectionalG: 1,
//   elevation: 0,
//   azimuth: -180,
//   exposure: 0,
// };

// sky.material.uniforms["turbidity"].value = effectController.turbidity;
// sky.material.uniforms["rayleigh"].value = effectController.rayleigh;
// sky.material.uniforms["mieCoefficient"].value = effectController.mieCoefficient;
// sky.material.uniforms["mieDirectionalG"].value =
//   effectController.mieDirectionalG;
// // sky.material.uniforms["sunPosition"].value.set(0.3, -0.038, -0.95);

// gui
//   .add(effectController, "exposure")
//   .min(0)
//   .max(2)
//   .onChange(() => {
//     renderer.toneMappingExposure = effectController.exposure;
//   });

// gui
//   .add(effectController, "elevation")
//   .min(-1)
//   .max(1)
//   .step(0.001)
//   .onChange(() => {
//     const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
//     const theta = THREE.MathUtils.degToRad(effectController.azimuth);
//     sun.setFromSphericalCoords(1, phi, theta);

//     sky.material.uniforms["sunPosition"].value.copy(sun);
//   });

// const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
// const theta = THREE.MathUtils.degToRad(effectController.azimuth);
// sun.setFromSphericalCoords(1, phi, theta);

// sky.material.uniforms["sunPosition"].value.copy(sun);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // update sizes object
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.001,
  100
);
camera.position.y = 2.4;

debugObject.lookAtX = 0;
debugObject.lookAtY = 0;
debugObject.lookAtZ = -3;
camera.lookAt(debugObject.lookAtX, debugObject.lookAtY, debugObject.lookAtZ);
const cameraOptions = gui.addFolder("Camera");

cameraOptions.add(camera.position, "x").min(0).max(6).step(0.01);
cameraOptions.add(camera.position, "y").min(0).max(6).step(0.01);
cameraOptions.add(camera.position, "z").min(-1).max(3).step(0.001);
cameraOptions
  .add(debugObject, "lookAtX")
  .min(0)
  .max(10)
  .step(0.01)
  .onChange(() => {
    camera.lookAt(
      debugObject.lookAtX,
      debugObject.lookAtY,
      debugObject.lookAtZ
    );
  });
cameraOptions
  .add(debugObject, "lookAtY")
  .min(0)
  .max(10)
  .step(0.01)
  .onChange(() => {
    camera.lookAt(
      debugObject.lookAtX,
      debugObject.lookAtY,
      debugObject.lookAtZ
    );
  });
cameraOptions
  .add(debugObject, "lookAtZ")
  .min(0)
  .max(10)
  .step(0.01)
  .onChange(() => {
    camera.lookAt(
      debugObject.lookAtX,
      debugObject.lookAtY,
      debugObject.lookAtZ
    );
  });

scene.add(camera);

/**
 * Controls
 */
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

/**
 * Animate
 */
const clock = new THREE.Clock();
let prevTime = 0;

debugObject.animateScene = true;
gui.add(debugObject, "animateScene");

const tick = () => {
  // elapsed time
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // update controls
  // controls.update();

  // Rotate Scene
  if (debugObject.animateScene) {
    group.rotation.x += 0.3 * deltaTime;
  }

  // render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

gui.hide();
window.addEventListener("keydown", (event) => {
  if (event.key === "h") {
    gui.show(gui._hidden);
  }
});
