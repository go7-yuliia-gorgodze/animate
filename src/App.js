import './App.css';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import model from './car.glb';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



function App() {
const vehicle = new YUKA.Vehicle();

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add( new YUKA.Vector3(0 , 0, -400));
path.add( new YUKA.Vector3(0, 0, 400));
path.loop = true;

vehicle.maxSpeed = 180;
const followPathBehavior = new YUKA.FollowPathBehavior(path, 1);
vehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
vehicle.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

let camera, scene, renderer, modelReady, clips;
let mixer
const mixers = [];
const wheels = [];
const clock = new THREE.Clock()
const stats = Stats()


init();
render();



function init() {
  const container = document.createElement( 'div' );
  document.body.appendChild( container );
  renderer = new THREE.WebGLRenderer({ antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 20000 );
  camera.position.set( 100, 100, 100 );
  
  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 'grey' );
  scene.environment = pmremGenerator.fromScene( environment ).texture;
  environment.dispose();

  const grid = new THREE.GridHelper( 1400, 100, 0x000000, 0x000000 );
  grid.material.opacity = 0.3;
  grid.material.depthWrite = true;
  grid.material.transparent = true;
  scene.add( grid );

  //light
  const light = new THREE.DirectionalLight( 'white', 2 );
  light.position.x = 300;
  light.position.y = 250;
  light.position.z = -500;
  scene.add( light );

  const dirLight = new THREE.DirectionalLight( 0x000000, 0.54 );
  dirLight.position.set( -8, 12, 8 );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  scene.add( dirLight );
  
  //сar
  let loader = new GLTFLoader();
    loader.load(model,  (gltf) => {
      clips = gltf.animations;
      const mixer = new THREE.AnimationMixer(gltf.scene);
      const clip = THREE.AnimationClip.findByName(clips, 'Car engine');
      const action = mixer.clipAction(clip);
      action.play();
      mixers.push(mixer);
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
     //wheels
      wheels.push(
        ...gltf.scene.getObjectByName( 'Front_wheel001' ).children,
        ...gltf.scene.getObjectByName( 'Front_wheel' ).children,
        ...gltf.scene.getObjectByName( 'Rear_wheel' ).children,
        ...gltf.scene.getObjectByName( 'Rear_wheel001' ).children,
        
      );
      vehicle.setRenderComponent(gltf.scene, sync);
      gltf.scene.matrixAutoUpdate = false;
      scene.add( gltf.scene );
      
      vehicle.scale = new YUKA.Vector3(0.5, 0.5, 0.5);
      vehicle.position.set(0, 0, 400)

    }, undefined, function (err) {
      console.error(err);
    });

  //cubes
  const boxGeometry = new THREE.BoxGeometry(20, 20, 1300);
  const basicMaterial = new THREE.MeshBasicMaterial({color: 0x0095DD});
  const cube = new THREE.Mesh(boxGeometry, basicMaterial);
  cube.position.x = -140;
  cube.position.y = 10
  const cubeSecondary = new THREE.Mesh(boxGeometry, basicMaterial);
  cubeSecondary.position.x = 140;
  cubeSecondary.position.y = 10
  scene.add(cubeSecondary);
  scene.add(cube);


  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 1000;
  controls.maxDistance = 1000;
  controls.target.set( 10, 90, - 16 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  const delta = clock.getDelta();
  entityManager.update(delta);
  mixers.forEach(function(mixer) {
    mixer.update(delta);
  });
  requestAnimationFrame(animate)
  if (modelReady) mixer.update(clock.getDelta())
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  render()
  stats.update()
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render() {
  const time = - performance.now() / 1000;
  for ( let i = 0; i < wheels.length; i ++ ) {
    wheels[ i ].rotation.z = time * Math.PI * 2;
  }
  renderer.render( scene, camera );
}

animate()

  return (
    <div className="App">
       <div id="threejs" />
    </div>
  );
}

export default App;
