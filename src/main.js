import * as THREE from 'three'

//scroll tracker
let scrollProgress = 0;         //this ranges from 0 to 1
const identityOverlay = document.getElementById('identity-overlay')

function updateIdentityOverlay() {
  if (!identityOverlay) return
  if (scrollProgress < 0.05) {
    identityOverlay.classList.remove('hidden')
  } else {
    identityOverlay.classList.add('hidden')
  }
}

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY 
    const maxScroll = document.body.scrollHeight - window.innerHeight
    scrollProgress = scrollY / maxScroll
    updateIdentityOverlay()
})      //this always has value between 0 and 1

updateIdentityOverlay()



// main scene
const scene = new THREE.Scene()

//FogExp2 is exponential fading type, with distance
scene.fog = new THREE.FogExp2(0x1a0f2e, 0.035)      //this makes a blurry type of view | also it makes objects fade into the background color as they get further away.
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

// (it's a MESH and it needs a geometry and a material) - this is ground
//every visible object in three is a mesh
const groundGeo = new THREE.CircleGeometry(50, 64) // large flat circle of radius 50 
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0d1a0d,    // very dark green (dead grass, dusk)
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

//=======================================================
// renderer
const canvas = document.getElementById('webgl')     //uses GPU webGL to paint onto the CANVAS/screen where the camera is pointing
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

//=======================================================
const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1.6, 8),    // Scene 0-1: starting position in forest
  new THREE.Vector3(0, 1.55, 5),   // Scene 2: begin moving forward
  new THREE.Vector3(0, 1.55, 3.5), // keep height as we approach the well
  new THREE.Vector3(0, 1.55, 2.1), // closer to the rim, still mostly level
  new THREE.Vector3(0, 1.45, 1.0), // right at the rim edge
  new THREE.Vector3(0, 1.05, 0.4), // crossing the rim gradually
  new THREE.Vector3(0, 0.4, 0),   // just inside the well mouth
  new THREE.Vector3(0, -1.8, 0),   // descending deeper inside
  new THREE.Vector3(0, -4.2, 0),   // lowest experience depth
  new THREE.Vector3(0, -2.2, 0),   // rising back toward the opening
  new THREE.Vector3(0, 1.8, -0.7), // emerging, facing outward
  new THREE.Vector3(0, 2.2, -3.2), // exit position for projects/contact
])

// This is what the camera will smoothly chase each frame
const targetPosition = new THREE.Vector3()
const targetLookAt  = new THREE.Vector3()
const currentLookAt = new THREE.Vector3()

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ---- LOOKAT PATH ----
// What the camera focuses on at each stage
const lookAtPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.8, 0),   // looking at the well from forest
  new THREE.Vector3(0, 0.75, 0),  // keep focus on the well rim
  new THREE.Vector3(0, 0.7, 0),   // still focused on the well top
  new THREE.Vector3(0, 0.4, 0),   // crossing the rim slowly
  new THREE.Vector3(0, 0.0, 0),   // just inside the well
  new THREE.Vector3(0, -1.4, 0),  // eye adjusting inside
  new THREE.Vector3(0, -3.8, 0),  // deeper interior depth
  new THREE.Vector3(0, -1.4, 0),  // preparing to exit
  new THREE.Vector3(0, 2.2, -1.2),// looking up through outlet
  new THREE.Vector3(0, 1.6, -6),  // looking out to the world
  new THREE.Vector3(0, 1.5, -8),  // final outward gaze
])

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
  const elapsed = clock.getElapsedTime()        //independent of the frame rate(prevents faster and slower refresh rate mismatches)

  // Slowly drift particles upward, reset when too high
  const pos = particles.geometry.attributes.position
  for (let i = 0; i < particleCount; i++) {
    pos.array[i * 3 + 1] += 0.003  // drift up

    if (pos.array[i * 3 + 1] > 6) {
      pos.array[i * 3 + 1] = 0     // reset to ground
    }
  }
  pos.needsUpdate = true  // tell Three.js the buffer changed

    const easedProgress = easeInOutCubic(scrollProgress)
    cameraPath.getPoint(easedProgress, targetPosition)
    lookAtPath.getPoint(easedProgress, targetLookAt)

    camera.position.lerp(targetPosition, 0.08)
    currentLookAt.lerp(targetLookAt, 0.08)
    camera.lookAt(currentLookAt)

    // dark older well mood at the beginning, then cleaner cinematic walls near the end
    const wallPhase = THREE.MathUtils.clamp((scrollProgress - 0.45) / 0.45, 0, 1)
    wallMat.color.lerpColors(new THREE.Color(0x191517), new THREE.Color(0x727680), wallPhase)
    wallMat.roughness = THREE.MathUtils.lerp(0.96, 0.28, wallPhase)
    rimMat.color.lerpColors(new THREE.Color(0x0f0d10), new THREE.Color(0xd1d7de), wallPhase)
    rimMat.roughness = THREE.MathUtils.lerp(0.9, 0.18, wallPhase)
    interiorMat.color.lerpColors(new THREE.Color(0x050508), new THREE.Color(0x2f3441), wallPhase)

    ambientLight.intensity = THREE.MathUtils.lerp(0.28, 0.75, wallPhase)
    sunLight.intensity = THREE.MathUtils.lerp(0.25, 1.0, wallPhase)
    scene.fog.density = THREE.MathUtils.lerp(0.05, 0.018, wallPhase)

    // Slowly rotate the well group (very subtle)
    wellGroup.rotation.y = elapsed * 0.02

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()

