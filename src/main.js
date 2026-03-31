import * as THREE from 'three'
import GUI from 'lil-gui'

// const gui = new GUI()

// // Tweak fog in real time
// const fogFolder = gui.addFolder('Fog')
// fogFolder.add(scene.fog, 'density', 0, 0.2, 0.001).name('Density')

// // Tweak sun light
// const lightFolder = gui.addFolder('Sun Light')
// lightFolder.add(sunLight, 'intensity', 0, 2, 0.01)
// lightFolder.add(sunLight.position, 'x', -20, 20, 0.1)
// lightFolder.add(sunLight.position, 'y', 0, 20, 0.1)

// // Tweak camera (manual exploration)
// const camFolder = gui.addFolder('Camera')
// camFolder.add(camera.position, 'x', -20, 20, 0.1)
// camFolder.add(camera.position, 'y', 0, 10, 0.1)
// camFolder.add(camera.position, 'z', -20, 20, 0.1)

// main scene
const scene = new THREE.Scene()

scene.fog = new THREE.FogExp2(0x1a0f2e, 0.035)

scene.background = new THREE.Color(0x1a0f2e)

const hemisphereLight = new THREE.HemisphereLight(
  0x2d1b69,  // sky color (deep indigo)
  0x0d0d0d,  // ground color (near black)
  0.8        // intensity
)
scene.add(hemisphereLight)

const sunLight = new THREE.DirectionalLight(0xff6b2b, 0.6) // warm orange
sunLight.position.set(-10, 4, -10) // low, from the left-back
sunLight.castShadow = true
sunLight.shadow.mapSize.set(1024, 1024)
sunLight.shadow.camera.far = 50
sunLight.shadow.camera.near = 1
sunLight.shadow.camera.left = -20
sunLight.shadow.camera.right = 20
sunLight.shadow.camera.top = 20
sunLight.shadow.camera.bottom = -20
scene.add(sunLight)

const ambientLight = new THREE.AmbientLight(0x120820, 0.5)
scene.add(ambientLight)

// ---- GROUND ----
const groundGeo = new THREE.CircleGeometry(50, 64) // large flat circle
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0d1a0d,    // very dark green (dead grass, dusk)
  roughness: 1,
  metalness: 0
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2  // flat on the XZ plane
ground.receiveShadow = true
scene.add(ground)


//WELL
const wellGroup = new THREE.Group()

// Outer wall
const wallGeo = new THREE.CylinderGeometry(1, 1.1, 1.2, 16, 1, true) // open-ended cylinder
const wallMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a2a,
  roughness: 0.9,
  metalness: 0.1,
  side: THREE.DoubleSide
})
const wall = new THREE.Mesh(wallGeo, wallMat)
wall.castShadow = true
wellGroup.add(wall)

// Well cap / rim (torus)
const rimGeo = new THREE.TorusGeometry(1.05, 0.08, 8, 32)
const rimMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
const rim = new THREE.Mesh(rimGeo, rimMat)
rim.rotation.x = Math.PI / 2
rim.position.y = 0.6
wellGroup.add(rim)

// Dark interior (just a dark disc visible from above)
const interiorGeo = new THREE.CircleGeometry(0.95, 32)
const interiorMat = new THREE.MeshStandardMaterial({ color: 0x000000 })
const interior = new THREE.Mesh(interiorGeo, interiorMat)
interior.rotation.x = -Math.PI / 2
interior.position.y = 0.61
wellGroup.add(interior)

wellGroup.position.set(0, 0.6, 0)  // center of scene, sitting on ground
scene.add(wellGroup)

//trees
function createTree(x, z, scale = 1) {
  const group = new THREE.Group()

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 1.5 * scale, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1a0f05, roughness: 1 })
  const trunk = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = 0.75 * scale
  trunk.castShadow = true
  group.add(trunk)

  // Foliage (two cones, offset for variation)
  const foliageGeo1 = new THREE.ConeGeometry(1 * scale, 2.5 * scale, 7)
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x0a1a08, roughness: 1 })
  const foliage1 = new THREE.Mesh(foliageGeo1, foliageMat)
  foliage1.position.y = 2.5 * scale
  foliage1.castShadow = true
  group.add(foliage1)

  const foliageGeo2 = new THREE.ConeGeometry(0.7 * scale, 1.8 * scale, 7)
  const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat)
  foliage2.position.y = 3.5 * scale
  group.add(foliage2)

  group.position.set(x, 0, z)
  return group
}

// Place trees around the scene in a rough ring
const treePositions = [
  [-5, -6], [5, -7], [-7, -3], [7, -4],
  [-9, -9], [9, -8], [-4, -12], [4, -11],
  [-12, -5], [11, -6], [-6, 5], [6, 4],
  [-8, 8], [8, 7]
]

treePositions.forEach(([x, z]) => {
  const scale = 0.8 + Math.random() * 0.6  // slight size variation
  scene.add(createTree(x, z, scale))
})

// ---- PARTICLES ----
const particleCount = 200
const positions = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 20  // x
  positions[i * 3 + 1] = Math.random() * 6            // y (above ground)
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20  // z
}

const particleGeo = new THREE.BufferGeometry()
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particleMat = new THREE.PointsMaterial({
  color: 0xffeedd,
  size: 0.04,
  sizeAttenuation: true,  // particles farther away appear smaller
  transparent: true,
  opacity: 0.6
})

const particles = new THREE.Points(particleGeo, particleMat)
scene.add(particles)


// renderer
const canvas = document.getElementById('webgl')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true  //smooth edges
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // cap at 2 for perf
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping  // cinematic color grading
renderer.toneMappingExposure = 0.8  // slightly underexposed = moody

//main Camera
const camera = new THREE.PerspectiveCamera(
  60,                                    //60 feels cinematic
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1,                                   // near clip
  200                                    // far clip — fog will hide beyond this
)

camera.position.set(0, 1.6, 8)  //verticle/standing height, facing the well
scene.add(camera)

//Handling resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//main render loop
const clock = new THREE.Clock()

function tick() {
  const elapsed = clock.getElapsedTime()

  // Slowly drift particles upward, reset when too high
  const pos = particles.geometry.attributes.position
  for (let i = 0; i < particleCount; i++) {
    pos.array[i * 3 + 1] += 0.003  // drift up
    if (pos.array[i * 3 + 1] > 6) {
      pos.array[i * 3 + 1] = 0     // reset to ground
    }
  }
  pos.needsUpdate = true  // tell Three.js the buffer changed

  // Slowly rotate the well group (very subtle)
  wellGroup.rotation.y = elapsed * 0.05

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()

