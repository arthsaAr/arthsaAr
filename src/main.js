import * as THREE from 'three'

// ============================================================
// SCROLL TRACKING
// scrollProgress: 0 → 1, drives camera + overlays
// ============================================================
let scrollProgress = 0

// ---- Progress bar DOM ----
const progressFill = document.getElementById('progress-fill')

// ---- Overlay visibility map ----
// [elementId, showAt, hideAt] — all in scrollProgress 0–1
const OVERLAYS = [
  ['section-identity',   0.00, 0.13],   // Scene 1 — Identity
  ['section-about',      0.15, 0.29],   // Scene 2 — About
  ['section-experience', 0.30, 0.51],   // Scene 3 — Experience
  ['section-skills',     0.53, 0.67],   // Scene 4 — Skills
  ['section-projects',   0.68, 0.83],   // Scene 5 — Projects (KEY)
  ['section-contact',    0.84, 0.95],   // Scene 6 — Contact
  ['section-final',      0.96, 1.00],   // Scene 7 — Final
]

function updateOverlays() {
  if (progressFill) {
    progressFill.style.width = (scrollProgress * 100).toFixed(2) + '%'
  }
  OVERLAYS.forEach(([id, start, end]) => {
    const el = document.getElementById(id)
    if (!el) return
    el.classList.toggle('visible', scrollProgress >= start && scrollProgress <= end)
  })
}

window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight
  scrollProgress  = maxScroll > 0 ? window.scrollY / maxScroll : 0
  updateOverlays()
})

updateOverlays() // init on load

// ============================================================
// SCENE
// ============================================================
const scene      = new THREE.Scene()
scene.fog        = new THREE.FogExp2(0x0e0818, 0.042)
scene.background = new THREE.Color(0x0e0818)

// ============================================================
// LIGHTING
// ============================================================

// Sky/ground — starts dark indigo, evolves toward a warmer dusk
const hemisphereLight = new THREE.HemisphereLight(0x2d1b69, 0x0d0d0d, 0.85)
scene.add(hemisphereLight)

// Directional "sun" — low-angle warm glow, intensifies over journey
const sunLight = new THREE.DirectionalLight(0xff7040, 0.28)
sunLight.position.set(-8, 5, -6)
sunLight.castShadow = true
sunLight.shadow.mapSize.set(1024, 1024)
sunLight.shadow.camera.far    = 60
sunLight.shadow.camera.near   = 0.5
sunLight.shadow.camera.left   = -25
sunLight.shadow.camera.right  = 25
sunLight.shadow.camera.top    = 25
sunLight.shadow.camera.bottom = -25
scene.add(sunLight)

// Fill ambient — begins very dark, brightens as journey progresses
const ambientLight = new THREE.AmbientLight(0x100818, 0.28)
scene.add(ambientLight)

// Secondary fill from the right — balancing light that fades in later
const fillLight = new THREE.DirectionalLight(0x3a4aff, 0)
fillLight.position.set(10, 6, -8)
scene.add(fillLight)

// Lightning flash — only in forest scenes
const lightningLight = new THREE.AmbientLight(0xaaccff, 0)
scene.add(lightningLight)

// ============================================================
// GROUND
// ============================================================
const groundGeo = new THREE.CircleGeometry(70, 64)
const groundMat = new THREE.MeshStandardMaterial({
  color:     0x0c180c,
  roughness: 1,
  metalness: 0,
})
const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x   = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// ============================================================
// WELL — decorative landmark, camera will pass beside it
// Position: slightly to the side so camera can pass near it
// ============================================================
const wellGroup = new THREE.Group()

const wallGeo = new THREE.CylinderGeometry(1, 1.1, 1.2, 16, 1, true)
const wallMat = new THREE.MeshStandardMaterial({
  color:     0x1a1515,
  roughness: 0.97,
  metalness: 0.04,
  side: THREE.DoubleSide,
})
const wall = new THREE.Mesh(wallGeo, wallMat)
wall.castShadow    = true
wall.receiveShadow = true
wellGroup.add(wall)

const rimGeo = new THREE.TorusGeometry(1.06, 0.09, 8, 32)
const rimMat = new THREE.MeshStandardMaterial({
  color:     0x141212,
  roughness: 0.90,
  metalness: 0.06,
})
const rim = new THREE.Mesh(rimGeo, rimMat)
rim.rotation.x = Math.PI / 2
rim.position.y = 0.6
wellGroup.add(rim)

// Dark mouth disc
const mouthGeo = new THREE.CircleGeometry(0.95, 32)
const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000 })
const mouth    = new THREE.Mesh(mouthGeo, mouthMat)
mouth.rotation.x = -Math.PI / 2
mouth.position.y = 0.61
wellGroup.add(mouth)

// Rope post (small detail)
const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6)
const postMat = new THREE.MeshStandardMaterial({ color: 0x1a0e06, roughness: 1 })
const post    = new THREE.Mesh(postGeo, postMat)
post.position.set(0, 1.4, 0)
post.castShadow = true
wellGroup.add(post)

// Horizontal bar across the top
const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6)
const barMat = new THREE.MeshStandardMaterial({ color: 0x1a0e06, roughness: 1 })
const bar    = new THREE.Mesh(barGeo, barMat)
bar.rotation.z = Math.PI / 2
bar.position.set(0, 2.2, 0)
bar.castShadow = true
wellGroup.add(bar)

// Place well slightly to the right of center so camera passes left of it
wellGroup.position.set(1.2, 0.6, 0)
scene.add(wellGroup)

// ============================================================
// TREES — procedural forest across the full camera path
// createTree returns {mesh, group} for animation access
// ============================================================
const treeData = []   // { group, phase, speed, amplitude }

function createTree(x, z, scale = 1) {
  const group = new THREE.Group()

  const trunkGeo = new THREE.CylinderGeometry(0.13 * scale, 0.18 * scale, 1.5 * scale, 6)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x180e05, roughness: 1 })
  const trunk    = new THREE.Mesh(trunkGeo, trunkMat)
  trunk.position.y = 0.75 * scale
  trunk.castShadow = true
  group.add(trunk)

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x08180a, roughness: 1 })

  // Three layered cones for denser canopy
  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.95 * scale, 2.4 * scale, 7), foliageMat)
  cone1.position.y = 2.45 * scale
  cone1.castShadow = true
  group.add(cone1)

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.66 * scale, 1.8 * scale, 7), foliageMat)
  cone2.position.y = 3.45 * scale
  group.add(cone2)

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.42 * scale, 1.2 * scale, 6), foliageMat)
  cone3.position.y = 4.2 * scale
  group.add(cone3)

  group.position.set(x, 0, z)
  return group
}

const treePositions = [
  // === Around camera start — z = 8 to 5 ===
  [-5,  10], [ 6,  11], [-8,   9], [ 9,  10],
  [-4,   8], [ 5,   7], [-9,   7], [ 7,   8],
  [-11,  9], [10,  10], [-6,  12], [ 8,  13],

  // === Near well area — z = 4 to -3 ===
  [-5,   5], [ 7,   4], [-8,   3], [ 9,   2],
  [-3,   4], [-10,  4], [10,   3], [-7,   1],
  [-11,  0], [11,  -1], [-9,  -2], [ 8,  -3],
  [-4,  -2], [ 5,  -3],

  // === Mid path — z = -4 to -10 ===
  [-5,  -6], [ 6,  -7], [-8,  -5], [ 7,  -6],
  [-10, -7], [ 9,  -8], [-4, -10], [ 5,  -9],
  [-12, -6], [11,  -7], [-7, -11], [ 6, -12],
  [-10,-10], [10,  -9],

  // === Far path — z = -11 to -20 ===
  [-5, -14], [ 6, -15], [-8, -13], [ 7, -14],
  [-10,-14], [ 9, -15], [-4, -17], [ 5, -16],
  [-11,-16], [10, -17], [-7, -19], [ 6, -20],
  [-13,-12], [12, -13], [-9, -18], [ 8, -19],

  // === Far sides for depth and framing ===
  [-16, -4], [15,  -5], [-17,  2], [16,   1],
  [-15,-12], [14, -11], [-16,-18], [15, -17],
  [-14, 6],  [13,   7],
]

treePositions.forEach(([x, z]) => {
  const scale = 0.75 + Math.random() * 0.65
  const tree  = createTree(x, z, scale)
  scene.add(tree)
  treeData.push({
    group:     tree,
    phase:     Math.random() * Math.PI * 2,
    speed:     0.30 + Math.random() * 0.28,
    amplitude: 0.016 + Math.random() * 0.014,
  })
})

// ============================================================
// PARTICLES — floating dust / leaves
// ============================================================
const PARTICLE_COUNT = 300
const pPositions     = new Float32Array(PARTICLE_COUNT * 3)
const pSpeeds        = new Float32Array(PARTICLE_COUNT)

for (let i = 0; i < PARTICLE_COUNT; i++) {
  pPositions[i * 3]     = (Math.random() - 0.5) * 28
  pPositions[i * 3 + 1] = Math.random() * 8
  pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30
  pSpeeds[i]            = 0.002 + Math.random() * 0.003
}

const pGeo = new THREE.BufferGeometry()
pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))

const pMat = new THREE.PointsMaterial({
  color:          0xffeedd,
  size:           0.05,
  sizeAttenuation: true,
  transparent:    true,
  opacity:        0.50,
})

const particles = new THREE.Points(pGeo, pMat)
scene.add(particles)

// ============================================================
// RENDERER
// ============================================================
const canvas   = document.getElementById('webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled   = true
renderer.shadowMap.type      = THREE.PCFSoftShadowMap
renderer.toneMapping         = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.75

// ============================================================
// CAMERA
// ============================================================
const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.1,
  200
)
camera.position.set(0, 1.6, 9)
scene.add(camera)

// ============================================================
// CAMERA PATH — horizontal forward journey through the forest
//
// Narrative:
//   Points 0–1 : open forest, identity reveal
//   Points 1–2 : drifting left, about section
//   Points 2–3 : approaching well from the left side
//   Points 3–4 : passing the well, experience
//   Points 4–5 : past well, centering, skills
//   Points 5–6 : deeper into open forest, projects
//   Points 6–7 : slight rise, contact
//   Points 7–8 : elevated final frame, looking back
// ============================================================
const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0.0,  1.60,  9.0),  // 0 — forest start
  new THREE.Vector3(-0.4,  1.58,  6.0),  // 1 — subtle left drift
  new THREE.Vector3(-1.5,  1.55,  3.2),  // 2 — about: passing left of well
  new THREE.Vector3(-2.2,  1.52,  0.5),  // 3 — experience: closest to well
  new THREE.Vector3(-1.6,  1.52, -2.2),  // 4 — past the well
  new THREE.Vector3(-0.5,  1.55, -4.8),  // 5 — centering: skills
  new THREE.Vector3( 0.0,  1.58, -7.2),  // 6 — projects: straight ahead
  new THREE.Vector3( 0.0,  1.76, -9.5),  // 7 — contact: slight rise
  new THREE.Vector3( 0.0,  2.55,-11.0),  // 8 — final: elevated, looking back
])

// ============================================================
// LOOKAT PATH — what the camera is aimed at each scene
//
// The well is at (1.2, 0.6, 0) — so point 3 looks toward it
// from the left, giving a cinematic "passing shot" of the well.
// Final point looks back at the well for the closing frame.
// ============================================================
const lookAtPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 1.0,  1.05,  2.5),  // 0 — looking toward well area
  new THREE.Vector3( 0.5,  1.00,  0.0),  // 1 — centering on well
  new THREE.Vector3( 0.8,  0.90, -2.0),  // 2 — about: looking past well
  new THREE.Vector3( 1.8,  0.80, -1.0),  // 3 — experience: looking at well!
  new THREE.Vector3( 0.8,  1.00, -5.0),  // 4 — shifting forward
  new THREE.Vector3( 0.0,  1.10, -8.5),  // 5 — skills: centered
  new THREE.Vector3( 0.0,  1.20,-11.0),  // 6 — projects: forward
  new THREE.Vector3( 0.0,  1.40,-13.5),  // 7 — contact: slightly up
  new THREE.Vector3( 1.2,  0.60,  0.0),  // 8 — final: looking BACK at the well
])

// Smooth-chase helpers (camera lerps toward targets each frame)
const targetPosition = new THREE.Vector3()
const targetLookAt   = new THREE.Vector3()
const currentLookAt  = new THREE.Vector3(0, 1.05, 2.5)

// ============================================================
// LIGHTNING STATE
// ============================================================
let lightningCountdown = 2 + Math.random() * 6
let lightningFade      = 0
const LIGHTNING_HELD   = 0.07
const APPROX_DELTA     = 1 / 60

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock()

function tick() {
  const elapsed = clock.getElapsedTime()

  // ---- Tree swaying — organic wind motion ----
  treeData.forEach(({ group, phase, speed, amplitude }) => {
    group.rotation.z = Math.sin(elapsed * speed + phase)          * amplitude
    group.rotation.x = Math.cos(elapsed * speed * 0.65 + phase)  * amplitude * 0.6
  })

  // ---- Particle drift — slow upward float ----
  const pPos = particles.geometry.attributes.position
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pPos.array[i * 3 + 1] += pSpeeds[i]
    if (pPos.array[i * 3 + 1] > 8) pPos.array[i * 3 + 1] = 0
  }
  pPos.needsUpdate = true

  // ---- Lightning (forest scenes only: scrollProgress < 0.20) ----
  if (scrollProgress < 0.20) {
    lightningCountdown -= APPROX_DELTA
    if (lightningCountdown <= 0) {
      lightningFade      = LIGHTNING_HELD + Math.random() * 0.08
      lightningCountdown = 3 + Math.random() * 9
    }
    if (lightningFade > 0) {
      lightningLight.intensity = 1.8 + Math.random() * 2.2
      lightningFade -= APPROX_DELTA
    } else {
      lightningLight.intensity = 0
    }
  } else {
    lightningLight.intensity = 0
  }

  // ---- Camera movement ----
  // Linear t: 0 → 1 maps directly to scroll progress.
  // The lerp (0.06) adds cinematic lag so it never snaps.
  const t = THREE.MathUtils.clamp(scrollProgress, 0, 1)
  cameraPath.getPoint(t, targetPosition)
  lookAtPath.getPoint(t, targetLookAt)

  camera.position.lerp(targetPosition, 0.06)
  currentLookAt.lerp(targetLookAt, 0.06)
  camera.lookAt(currentLookAt)

  // ---- Lighting evolution: dark forest → bright open world ----
  // Phase 0 = dark (scroll start), Phase 1 = bright (scroll end)
  const lightPhase = THREE.MathUtils.clamp((scrollProgress - 0.15) / 0.72, 0, 1)
  const eased      = lightPhase * lightPhase * (3 - 2 * lightPhase) // smoothstep

  ambientLight.intensity  = THREE.MathUtils.lerp(0.28, 1.10, eased)
  sunLight.intensity      = THREE.MathUtils.lerp(0.28, 1.25, eased)
  fillLight.intensity     = THREE.MathUtils.lerp(0.00, 0.40, eased)
  scene.fog.density       = THREE.MathUtils.lerp(0.042, 0.010, eased)

  // Sky color: deep indigo → lighter dusk blue
  hemisphereLight.color.lerpColors(
    new THREE.Color(0x2d1b69),
    new THREE.Color(0x3a5aaa),
    eased
  )
  hemisphereLight.groundColor.lerpColors(
    new THREE.Color(0x0d0d0d),
    new THREE.Color(0x1a2818),
    eased
  )

  // Background shifts slightly as world brightens
  scene.background.lerpColors(
    new THREE.Color(0x0e0818),
    new THREE.Color(0x0d1825),
    eased
  )

  // ---- Well materials evolve: worn dark stone → clean grey ----
  const wallPhase = THREE.MathUtils.clamp((scrollProgress - 0.10) / 0.80, 0, 1)
  const wallEased = wallPhase * wallPhase * (3 - 2 * wallPhase)

  wallMat.color.lerpColors(
    new THREE.Color(0x151212),
    new THREE.Color(0x7a8088),
    wallEased
  )
  wallMat.roughness = THREE.MathUtils.lerp(0.97, 0.28, wallEased)

  rimMat.color.lerpColors(
    new THREE.Color(0x121010),
    new THREE.Color(0xc8d2d8),
    wallEased
  )
  rimMat.roughness = THREE.MathUtils.lerp(0.90, 0.18, wallEased)

  // ---- Well: very slow scenic rotation ----
  wellGroup.rotation.y = elapsed * 0.016

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()