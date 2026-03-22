import * as THREE from 'three'

const roomWidth = 10
const roomHeight = 4
const roomDepth = 20

const materials = {
  wall: new THREE.MeshStandardMaterial({ 
    color: '#080810',
    roughness: 0.6,
    metalness: 0.2,
    side: THREE.DoubleSide,
  }),
  floor: new THREE.MeshStandardMaterial({ 
    color: '#0a0a14',
    roughness: 0.2,
    metalness: 0.3,
    side: THREE.DoubleSide,
    }),
}


//animation for the rooms/lights
export function turnOnLights(scene) {
  const ambient = scene.children.find(c => c.isAmbientLight)
  const point = scene.children.find(c => c.isPointLight)

  let intensity = 0
  const interval = setInterval(() => {
    intensity += 0.02
    ambient.intensity = intensity * 8
    point.intensity = intensity * 40
    if (intensity >= 1) clearInterval(interval)

    const floor = scene.children.find(c => c.isPointLight && c.position.y < 0)
    if (floor) floor.intensity = intensity * 1.5
  }, 30)
}


export function initRoom(scene) {
    const walls = []

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth, roomDepth),
        materials.floor
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -roomHeight / 2
    scene.add(floor)

    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth, roomDepth),
        materials.wall
    )
    ceiling.rotation.x = Math.PI / 2
    ceiling.position.y = roomHeight / 2
    scene.add(ceiling)

    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth, roomHeight),
        materials.wall
    )
    backWall.position.z = -roomDepth / 2
    scene.add(backWall)

    const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomDepth, roomHeight),
        materials.wall
    )
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.x = -roomWidth / 2
    scene.add(leftWall)

    const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomDepth, roomHeight),
        materials.wall
    )
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.x = roomWidth / 2
    scene.add(rightWall)

    //adding lights for the room(overall making it visible)
    const ambientLight = new THREE.AmbientLight('#ffffff', 0)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight('#fff5e0', 0, 30)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)

    //second light
    const floorLight = new THREE.PointLight('#ff9944', 0, 15)
    floorLight.position.set(0, -1.5, 0)
    scene.add(floorLight)
}