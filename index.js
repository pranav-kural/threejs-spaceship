import { dlog } from "./util/dlog";
import { AppConfig } from "./config.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { errorHandler } from "./util/errorHandler.js";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

dlog.log("Index.js loaded");

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbcc5);

const cameraConfig = {
  fov: 130,
  aspect: (window.innerWidth * 0.5) / window.innerHeight,
  near: 0.1,
  far: 1000,
};

// front camera
const frontCamera = new THREE.PerspectiveCamera(
  cameraConfig.fov,
  cameraConfig.aspect,
  cameraConfig.near,
  cameraConfig.far
);
frontCamera.position.z = 5;
frontCamera.lookAt(scene.position);

// top camera
const topCamera = new THREE.PerspectiveCamera(
  cameraConfig.fov,
  cameraConfig.aspect,
  cameraConfig.near,
  cameraConfig.far
);
topCamera.position.y = 5;
topCamera.rotation.x = -Math.PI / 2; // Rotate the camera to look down
topCamera.lookAt(scene.position);

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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
    // gltf.scene.rotation.set(0.3, 0.2, 0.2);

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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Animate the sphere's position
  if (gltf) {
    const time = Date.now() * 0.001;
    const sphereX = Math.sin(time) * 2; // Animate along the x-axis
    const sphereY = Math.cos(time) * 2; // Animate along the y-axis
    gltf.scene.position.set(sphereX, sphereY, 0);
  }

  // Set clear color for the renderer
  renderer.setClearColor(0x9bbcc5, 1); // Set the background color

  // Render the front view
  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, frontCamera);

  // Render the top view
  renderer.setViewport(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  );
  renderer.setScissor(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  );
  renderer.setScissorTest(true);
  renderer.render(scene, topCamera);
}

if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("main").appendChild(warning);
}
