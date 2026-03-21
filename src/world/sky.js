import * as THREE from 'three';

//color object for our phases of moon(temp for now)

const phases = {
  dawn: {
    topColor: new THREE.Color('#1a0a2e'),
    midColor: new THREE.Color('#8b2252'),
    horizonColor: new THREE.Color('#ff6b35'),
  },
  day: {
    topColor: new THREE.Color('#0a1628'),
    midColor: new THREE.Color('#1a4a8a'),
    horizonColor: new THREE.Color('#c8e6ff'),
  },
  dusk: {
    topColor: new THREE.Color('#0d0d1a'),
    midColor: new THREE.Color('#4a1a5c'),
    horizonColor: new THREE.Color('#ff3d00'),
  },
  night: {
    topColor: new THREE.Color('#000008'),
    midColor: new THREE.Color('#050520'),
    horizonColor: new THREE.Color('#0a1a3a'),
  }
}

const phaseOrder = ['dawn', 'day', 'dusk', 'night']
let cycleProgress = 0  //goes from 0 to 1
const cycleDuration = 50  //full loop in 100 seconds

const skyGeometry = new THREE.SphereGeometry(500, 32, 32);

//material for sky
const skyMat = new THREE.ShaderMaterial({
  uniforms: {
    topColor: { value: new THREE.Color('#1a0a2e') },
    midColor: { value: new THREE.Color('#8b2252') },
    horizonColor: { value: new THREE.Color('#ff6b35') },
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 midColor;
    uniform vec3 horizonColor;
    varying vec3 vPosition;
    void main() {
      float h = normalize(vPosition).y;
      vec3 color;
      if (h > 0.0) {
        color = mix(midColor, topColor, h);
      } else {
        color = mix(midColor, horizonColor, -h);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.BackSide
})

const skyMesh = new THREE.Mesh(skyGeometry, skyMat)

export function initSky(scene){
    scene.add(skyMesh)
}

export function updateSky(scene, deltaTime) {
    cycleProgress = cycleProgress + deltaTime/cycleDuration;
    if(cycleProgress > 1){
        cycleProgress = cycleProgress-1;
    }

    const totalPhases = phaseOrder.length;
    const scaled = cycleProgress * totalPhases
    const currentIndex = Math.floor(scaled)
    const nextIndex = (currentIndex+1) % totalPhases
    const blend = scaled - currentIndex

    const current = phases[phaseOrder[currentIndex]]
    const next = phases[phaseOrder[nextIndex]]

    //using lerp to blend two colors...!
    skyMat.uniforms.topColor.value.copy(current.topColor).lerp(next.topColor, blend)
    skyMat.uniforms.midColor.value.copy(current.midColor).lerp(next.midColor, blend)
    skyMat.uniforms.horizonColor.value.copy(current.horizonColor).lerp(next.horizonColor, blend)



}