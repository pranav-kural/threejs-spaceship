import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function loadModel(file, success, progress, error) {
  const loader = new GLTFLoader();
  loader.load(file, success, progress, error);
}

// Instantiate a loader
const loader = new GLTFLoader();

// Load a glTF resource
loader.load(
  // resource URL
  "assets/objects/spaceship/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    scene.add(gltf.scene);

    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);
