import * as THREE from 'three'
import './style.css'
import { startBoot } from './ui/boot.js'
import { initRoom, turnOnLights } from './world/room.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 0, 8)
camera.lookAt(0, 0, -10)

const clock = new THREE.Clock()

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('world'),
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

startBoot(() => {
  console.log('boot complete — entering world')
  initRoom(scene)
  setTimeout(() => turnOnLights(scene), 800)
})