import { dlog } from "./dlog.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// function to load object
export async function loadObject(
  scene,
  file,
  setObject,
  position = [0, 0, 0],
  rotation = [0.1, 0, 0]
) {
  // Success handler to add object to scene
  const loadingSuccessHandler = (obj) => {
    dlog.log("Object loaded successfully");
    dlog.log(obj);
    // add object to scene
    scene.add(obj.scene);

    // change color
    obj.scene.traverse((node) => {
      if (node.isMesh) {
        node.material.color.set("white");
      }
    });

    // set position
    obj.scene.position.set(...position);
    // set rotation
    obj.scene.rotation.set(...rotation);

    // set object to global variable
    setObject(obj);
  };

  // Progress handler to log loading progress
  const progressHandler = (xhr) => {
    dlog.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  };

  // Load object
  const loader = new GLTFLoader();
  loader.load(file, loadingSuccessHandler, progressHandler, errorHandler);
}
