import { dlog } from "./util/dlog.js";
import { AppConfig } from "./config.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import * as dat from "dat.gui";
import WebGL from "three/addons/capabilities/WebGL.js";

dlog.log("Index.js loaded");

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbcc5);

// configurations for the cameras
const cameraConfig = {
  fov: 100,
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

// Load object
let gltf;
loadObject(scene);

// function to load object
async function loadObject(scene) {
  // Success handler to add object to scene
  const loadingSuccessHandler = (obj) => {
    dlog.log("Object loaded successfully");
    // store object
    gltf = obj;
    dlog.log(gltf);
    // add object to scene
    scene.add(gltf.scene);

    // change color
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        node.material.color.set("white");
      }
    });

    // set position
    gltf.scene.position.set(0, 0, 0);
    // set rotation
    gltf.scene.rotation.set(0.1, 0, 0);

    // add directional light on the object
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
  };

  // Progress handler to log loading progress
  const progressHandler = (xhr) => {
    dlog.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  };

  // Load object
  const loader = new GLTFLoader();
  await loader.load(
    AppConfig.filePathObjectToLoad,
    loadingSuccessHandler,
    progressHandler,
    errorHandler
  );
}

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

  if (gltf && gltf.scene) {
    gltf.scene.rotation.x += objRotation.x;
    gltf.scene.rotation.y += objRotation.y;
    gltf.scene.rotation.z += objRotation.z;
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
