import { dlog } from "./util/dlog.js";
import { AppConfig } from "./config.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import * as dat from "dat.gui";
import WebGL from "three/addons/capabilities/WebGL.js";
import { ThreeMFLoader } from "three/examples/jsm/Addons.js";

dlog.log("Index.js loaded");

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x292929);

// configurations for the cameras
const cameraConfig = {
  fov: 140,
  topFov: 110,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  frontCameraPosition: [0, 0, 5],
  //topCameraPosition: [0, 5, 0],
  // rotate top camera to look down
  //topCameraRotation: [-Math.PI / 2, 0, 0],
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

/* // top camera
const topCamera = new THREE.PerspectiveCamera(
  cameraConfig.topFov,
  cameraConfig.aspect,
  cameraConfig.near,
  cameraConfig.far
);
topCamera.position.set(...cameraConfig.topCameraPosition);
topCamera.rotation.set(...cameraConfig.topCameraRotation);
topCamera.lookAt(scene.position); */

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load object
let gltf;
loadObject(scene);

const geometry = new THREE.BufferGeometry();
const textureLoader = new THREE.TextureLoader();

var ground = textureLoader.load("../assets/objects/ground/textures/snow_02_diff_4k.jpg");
ground.wrapS = ground.wrapT = THREE.RepeatWrapping;
ground.repeat.set(100,100);
ground.anisotropy = 1;

var groundMaterial = new THREE.MeshStandardMaterial( { map: ground } );

var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000000, 1000000 ), groundMaterial );
mesh.position.y = -25;
mesh.rotation.x = 5;
mesh.receiveShadow = true;
scene.add( mesh );

/* // Snowy Ground
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry( 11000, 11000 ),
  new THREE.MeshPhongMaterial( {color:'white'} )
);
ground.position.y = -30;
ground.rotation.set( -Math.PI/2, 0, 0 );
scene.add( ground ); */

// Adding Snow
let snowflakes;
let positions = [], velocities = [];

// Number of Snowflakes
const N = 100000

// Snowflake Spawn Limitations
const maxX = 500, minX = maxX/2;
const maxZ = 300, minZ = maxZ/2;
const minY = 20;

addSnowflakes();

// Initial Snowflake Creation
function addSnowflakes() {
  for (let i = 0; i < N; i++) {
    positions.push(
      Math.floor(Math.random() * maxX - minX),
      Math.floor(Math.random() * 200),
      Math.floor(Math.random() * maxZ - minZ));

    // Constant Velocity for each Snowflake
    velocities.push(
      Math.floor(Math.random() * 6 - 3) * 0.1, // x movement varies from positive to negative
      Math.floor(Math.random() * 5 + 1) * -0.2, // y movement always negative due to gravity
      Math.floor(Math.random() * 6 + 1) * 0.5); // z movement always positive and non-zero to simulate movement while following spaceship
  }

  // Every Set of 3 Positions/Velocities Attributed to each Snowflake [x,y,z]
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  // Mapping Texture for Snowflake
  const flakeMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: textureLoader.load("../assets/objects/snowflake/snowflake.png"),
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    opacity: 0.4
  })

  snowflakes = new THREE.Points(geometry,flakeMaterial);
  scene.add(snowflakes);
}

// Continuously Updating Snowflake Positions Based on Velocities
function updateSnowflakes(){
  for (let i = 0; i < N*3; i+= 3){
    snowflakes.geometry.attributes.position.array[i] += snowflakes.geometry.attributes.velocity.array[i];
    snowflakes.geometry.attributes.position.array[i+1] += snowflakes.geometry.attributes.velocity.array[i+1];
    snowflakes.geometry.attributes.position.array[i+2] += snowflakes.geometry.attributes.velocity.array[i+2];

    // Position Resets Once Ground is Reached
    if(snowflakes.geometry.attributes.position.array[i+1] < -30) {
      snowflakes.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxX - minX);
      snowflakes.geometry.attributes.position.array[i+1] = Math.floor(Math.random() * 200 + minY);
      snowflakes.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxZ - minZ);
    }
  }

  snowflakes.geometry.attributes.position.needsUpdate = true;
}

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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
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

// default harmonograph parameters
const harmonographDefaults = {
  Ax: 1,
  Ay: 1,
  Az: 1,
  As: 1,
  wx: 1,
  wy: 2,
  ws: 3,
  wz: 2,
  px: Math.PI / 2,
  py: Math.PI / 4,
  pz: Math.PI / 2,
  ps: Math.PI / 6,
  alpha_x: 1,
  alpha_y: 1,
  alpha_z: 1,
  alpha_s: 1,
};

// Harmonograph parameters
let Ax = harmonographDefaults.Ax;
let Ay = harmonographDefaults.Ay;
let Az = harmonographDefaults.Az;
let As = harmonographDefaults.As;
let wx = harmonographDefaults.wx;
let wy = harmonographDefaults.wy;
let ws = harmonographDefaults.ws;
let wz = harmonographDefaults.wz;
let px = harmonographDefaults.px;
let py = harmonographDefaults.py;
let pz = harmonographDefaults.pz;
let ps = harmonographDefaults.ps;

// Damping factors
let alpha_x = harmonographDefaults.alpha_x;
let alpha_y = harmonographDefaults.alpha_y;
let alpha_z = harmonographDefaults.alpha_z;
let alpha_s = harmonographDefaults.alpha_s;

// GUI Controls
const gui = new dat.GUI();
gui.add({ reset: () => resetAnimation() }, "reset").name("Reset Animation");
gui.add({ clear: () => clearScene() }, "clear").name("Clear Scene");

// Harmonograph controls
const harmonographControls = {
  px: (px * 180) / Math.PI, // Convert radians to degrees for GUI slider
  py: (py * 180) / Math.PI,
  pz: (pz * 180) / Math.PI,
  ps: (ps * 180) / Math.PI,
  alpha_x,
  alpha_y,
  alpha_z,
  alpha_s,
};

// Harmonograph controls folder
const harmonographFolder = gui.addFolder("Harmonograph Controls");
harmonographFolder
  .add(harmonographControls, "px", 0, 360, 1)
  .name("Phase x")
  .onChange(updatePhases);
harmonographFolder
  .add(harmonographControls, "py", 0, 360, 1)
  .name("Phase y")
  .onChange(updatePhases);
harmonographFolder
  .add(harmonographControls, "pz", 0, 360, 1)
  .name("Phase z")
  .onChange(updatePhases);
harmonographFolder
  .add(harmonographControls, "ps", 0, 360, 1)
  .name("Phase s")
  .onChange(updatePhases);
harmonographFolder
  .add(harmonographControls, "alpha_x", 0, 1, 0.001)
  .name("Damping x")
  .onChange(updateDamping);
harmonographFolder
  .add(harmonographControls, "alpha_y", 0, 1, 0.001)
  .name("Damping y")
  .onChange(updateDamping);
harmonographFolder
  .add(harmonographControls, "alpha_z", 0, 1, 0.001)
  .name("Damping z")
  .onChange(updateDamping);
harmonographFolder
  .add(harmonographControls, "alpha_s", 0, 1, 0.001)
  .name("Damping s")
  .onChange(updateDamping);
harmonographFolder.open(); // Open the folder by default

// Update phases when GUI sliders change
function updatePhases() {
  dlog.log("Updating phases");
  px = (harmonographControls.px * Math.PI) / 180; // Convert degrees to radians
  py = (harmonographControls.py * Math.PI) / 180;
  pz = (harmonographControls.pz * Math.PI) / 180;
  ps = (harmonographControls.ps * Math.PI) / 180;
}

// Update damping factors dynamically
function updateDamping() {
  alpha_x = harmonographControls.alpha_x;
  alpha_y = harmonographControls.alpha_y;
  alpha_z = harmonographControls.alpha_z;
  alpha_s = harmonographControls.alpha_s;

  dlog.log("Dampping factors updated");
  dlog.log(
    "alpha_x: " +
      alpha_x +
      " alpha_y: " +
      alpha_y +
      " alpha_z: " +
      alpha_z +
      " alpha_s: " +
      alpha_s
  );
}

// Reset animation
function resetAnimation() {
  dlog.log("Resetting animation");
  // reset animation parameters
  Ax = harmonographDefaults.Ax;
  Ay = harmonographDefaults.Ay;
  Az = harmonographDefaults.Az;
  As = harmonographDefaults.As;
  wx = harmonographDefaults.wx;
  wy = harmonographDefaults.wy;
  ws = harmonographDefaults.ws;
  wz = harmonographDefaults.wz;
  px = harmonographDefaults.px;
  py = harmonographDefaults.py;
  pz = harmonographDefaults.pz;
  ps = harmonographDefaults.ps;

  // reset damping factors
  alpha_x = harmonographDefaults.alpha_x;
  alpha_y = harmonographDefaults.alpha_y;
  alpha_z = harmonographDefaults.alpha_z;
  alpha_s = harmonographDefaults.alpha_s;

  // Reset GUI sliders
  harmonographControls.px = (px * 180) / Math.PI;
  harmonographControls.py = (py * 180) / Math.PI;
  harmonographControls.pz = (pz * 180) / Math.PI;
  harmonographControls.ps = (ps * 180) / Math.PI;
  harmonographControls.alpha_x = alpha_x;
  harmonographControls.alpha_y = alpha_y;
  harmonographControls.alpha_z = alpha_z;
  harmonographControls.alpha_s = alpha_s;

  updateDamping();
  updatePhases();
}

// Clear the scene
function clearScene() {
  dlog.log("Clearing scene");
  scene.remove.apply(scene, scene.children);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updateSnowflakes();

  // Move Ground to Simulate Camera Movement Following Spaceship
  mesh.translateY(-3);

  // Animate the object's position
  if (gltf) {
    // Time variable
    const time = Date.now() * 0.001;

    // Apply damping
    Ax *= alpha_x;
    Ay *= alpha_y;
    Az *= alpha_z;
    As *= alpha_s;

    // Harmonograph equations
    const x = Ax * Math.sin(wx * time + px) + As * Math.sin(ws * time + ps);
    const y = Ay * Math.sin(wy * time + py);
    const z = Az * Math.sin(wz * time + pz);

    gltf.scene.position.set(x, y, z);
  }

  // Set clear color for the renderer
  renderer.setClearColor('0x9bbcc5', 1); // Set the background color

  // Render the front view
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
  renderer.setScissorTest(true);
  renderer.render(scene, frontCamera);

  // Render the top view
/*   renderer.setViewport(
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
  renderer.render(scene, topCamera); */
}

// Check if WebGL is available
if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("main").appendChild(warning);
}
