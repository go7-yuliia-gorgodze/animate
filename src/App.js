import './App.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import model from './low-poly_truck_car_drifter.glb';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const parcelPath = new URL('./low-poly_truck_car_drifter_data.bin', import.meta.url);

function App() {

let camera, scene, renderer;

init();
render();

function init() {

  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 0, 100, 0 );

  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xbbbbbb );
  scene.environment = pmremGenerator.fromScene( environment ).texture;
  environment.dispose();

  const grid = new THREE.GridHelper( 500, 10, 0xffffff, 0xffffff );
  grid.material.opacity = 0.5;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  scene.add( grid );

    let loader = new GLTFLoader();
    loader.load(model, function (geometry) {
      console.log(geometry);
      // if the model is loaded successfully, add it to your scene here
    }, undefined, function (err) {
      console.error(err);
    });


  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 400;
  controls.maxDistance = 1000;
  controls.target.set( 10, 90, - 16 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  render();

}

//

function render() {

  renderer.render( scene, camera );

}


  return (
    <div className="App">
       <div id="threejs" />
    </div>
  );
}

export default App;
