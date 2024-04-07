import { dlog } from "./util/dlog.js";
import { AppConfig } from "./config.js";
import { loadObject } from "./util/loader.js";
import * as THREE from "three";
import * as dat from "dat.gui";
import WebGL from "three/addons/capabilities/WebGL.js";

dlog.log("Index.js loaded");

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbcc5);

// configurations for the cameras
const cameraConfig = {
  fov: 130,
  topFov: 110,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  frontCameraPosition: [0, 0, 5],
  topCameraPosition: [0, 5, 0],
  // rotate top camera to look down
  topCameraRotation: [-Math.PI / 2, 0, 0],
};

// front camera
const frontCamera = new THREE.PerspectiveCamera(
  cameraConfig.fov,
  cameraConfig.aspect,
  cameraConfig.near,
  cameraConfig.far
);
frontCamera.position.set(...cameraConfig.frontCameraPosition);
frontCamera.lookAt(scene.position);

// top camera
const topCamera = new THREE.PerspectiveCamera(
  cameraConfig.topFov,
  cameraConfig.aspect,
  cameraConfig.near,
  cameraConfig.far
);
topCamera.position.set(...cameraConfig.topCameraPosition);
topCamera.rotation.set(...cameraConfig.topCameraRotation);
topCamera.lookAt(scene.position);

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
document.body.appendChild(renderer.domElement);

// Load spaceship object
let spaceship;
let spaceshipPos = {
  x: 0,
  y: 0,
  z: 1,
};
let spaceshipRot = {
  x: 0,
  y: 0,
  z: 0,
};
const setSpaceship = (obj) => (spaceship = obj);
loadObject(
  scene,
  AppConfig.spaceshipObjFile,
  setSpaceship,
  [spaceshipPos.x, spaceshipPos.y, spaceshipPos.z],
  [spaceshipRot.x, spaceshipRot.y, spaceshipRot.z]
);
let snowMountain;
const setSnowMountain = (obj) => (snowMountain = obj);
let snowMountainPos = {
  x: 20,
  y: -24,
  z: -24,
};
let snowMountainRot = {
  x: 0.1,
  y: 0.8,
  z: 0,
};
loadObject(
  scene,
  AppConfig.snowMountainObjFile,
  setSnowMountain,
  [snowMountainPos.x, snowMountainPos.y, snowMountainPos.z],
  [snowMountainRot.x, snowMountainRot.y, snowMountainRot.z]
);

// add directional light on the object
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Controls for spaceship object
let objRotation = {
  x: 0,
  y: 0,
  z: 0,
  speed: 0.01,
};

// GUI Controls
const gui = new dat.GUI();
gui.add({ clear: () => clearScene() }, "clear").name("Clear Scene");
const rotationFolder = gui.addFolder("Rotation Velocity");
rotationFolder
  .add(objRotation, "x", -0.1, 0.1)
  .name("X-Axis Velocity")
  .listen();
rotationFolder
  .add(objRotation, "y", -0.1, 0.1)
  .name("Y-Axis Velocity")
  .listen();
rotationFolder
  .add(objRotation, "z", -0.1, 0.1)
  .name("Z-Axis Velocity")
  .listen();
rotationFolder.add(objRotation, "speed", 0, 0.1).name("Speed").listen();
rotationFolder.open();

const spaceshipFolder = gui.addFolder("Spaceship Position");
spaceshipFolder.add(spaceshipPos, "x", -50, 50).name("X Position").listen();
spaceshipFolder.add(spaceshipPos, "y", -50, 50).name("Y Position").listen();
spaceshipFolder.add(spaceshipPos, "z", -50, 50).name("Z Position").listen();
spaceshipFolder.open();

const snowMountainFolder = gui.addFolder("Snow Mountain Position");
snowMountainFolder
  .add(snowMountainPos, "x", -50, 50)
  .name("X Position")
  .listen();
snowMountainFolder
  .add(snowMountainPos, "y", -50, 50)
  .name("Y Position")
  .listen();
snowMountainFolder
  .add(snowMountainPos, "z", -50, 50)
  .name("Z Position")
  .listen();
snowMountainFolder.open();

const snowMountainRotationFolder = gui.addFolder("Snow Mountain Rotation");
snowMountainRotationFolder
  .add(snowMountainRot, "x", -Math.PI, Math.PI)
  .name("X Rotation")
  .listen();
snowMountainRotationFolder
  .add(snowMountainRot, "y", -Math.PI, Math.PI)
  .name("Y Rotation")
  .listen();
snowMountainRotationFolder
  .add(snowMountainRot, "z", -Math.PI, Math.PI)
  .name("Z Rotation")
  .listen();
snowMountainRotationFolder.open();

// Set keyboard controls
function onKeyDown(event) {
  var keyCode = event.which;

  // Adjust velocity based on key press
  if (keyCode == 38) {
    // Arrow up
    objRotation.x -= objRotation.speed;
  } else if (keyCode == 40) {
    // Arrow down
    objRotation.x += objRotation.speed;
  } else if (keyCode == 37) {
    // Arrow left

    // if shift key is pressed, rotate around z axis
    if (event.shiftKey) {
      objRotation.z += objRotation.speed;
    } else {
      objRotation.y -= objRotation.speed;
    }
  } else if (keyCode == 39) {
    // Arrow right

    // if shift key is pressed, rotate around z axis
    if (event.shiftKey) {
      objRotation.z -= objRotation.speed;
    } else {
      objRotation.y += objRotation.speed;
    }
  } else if (event.shiftKey && keyCode == 37) {
    // Shift + Arrow left
    objRotation.z -= objRotation.speed;
  }
}

// Set event listener for keyboard controls
document.addEventListener("keydown", onKeyDown, false);

function onDocumentKeyUp(event) {
  // Optional: Adjust this to control how quickly the object stops rotating
  objRotation.x = 0;
  objRotation.y = 0;
  objRotation.z = 0;
}

document.addEventListener("keyup", onDocumentKeyUp, false);

// Clear the scene
function clearScene() {
  dlog.log("Clearing scene");
  scene.remove.apply(scene, scene.children);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Set clear color for the renderer
  renderer.setClearColor(0x9bbcc5, 1);

  if (spaceship && spaceship.scene) {
    spaceship.scene.position.set(
      spaceshipPos.x,
      spaceshipPos.y,
      spaceshipPos.z
    );
    spaceship.scene.rotation.set(
      spaceshipRot.x,
      spaceshipRot.y,
      spaceshipRot.z
    );
    spaceship.scene.rotation.x += objRotation.x;
    spaceship.scene.rotation.y += objRotation.y;
    spaceship.scene.rotation.z += objRotation.z;
  }

  if (snowMountain && snowMountain.scene) {
    snowMountain.scene.position.set(
      snowMountainPos.x,
      snowMountainPos.y,
      snowMountainPos.z
    );
    snowMountain.scene.rotation.set(
      snowMountainRot.x,
      snowMountainRot.y,
      snowMountainRot.z
    );
  }

  // Render the front view
  renderer.render(scene, frontCamera);
}

// Check if WebGL is available
if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("main").appendChild(warning);
}
