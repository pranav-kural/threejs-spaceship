import { dlog } from "./util/dlog";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

dlog.log("Index.js loaded");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshNormalMaterial();
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // sphere.rotation.x += 0.01;
  // sphere.rotation.y += 0.01;

  renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("main").appendChild(warning);
}
