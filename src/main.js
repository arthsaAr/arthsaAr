import * as THREE from 'three'  /**threejs contents */
import './style.css'
import { initSky, updateSky } from './world/sky';

/**For threejs, we need three things
 * 1. Scene: the world
 * 2. Camera: the eye
 * 3. Render: gameloop thing
 */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 50;

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('world'),   //drawing in canvas with id world
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function animate() {
  requestAnimationFrame(animate)
  const deltaTime = clock.getDelta();
  updateSky(scene, deltaTime);
  renderer.render(scene, camera)
  initSky(scene)
}

animate()