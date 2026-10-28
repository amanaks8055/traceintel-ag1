import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const material = (color, roughness, metalness) => new THREE.MeshStandardMaterial({ color, roughness, metalness })
const MT = { R: material(0xd5001c, 0.4, 0.3), W: material(0xf2f2f0, 0.6, 0.1), S: material(0x9aa1a8, 0.3, 0.85), D: material(0x26262a, 0.7, 0.3) }
const ring = (count, radius, build) => Array.from({ length: count }, (_, index) => { const angle = index / count * Math.PI * 2; return build(Math.cos(angle) * radius, Math.sin(angle) * radius) })
const SPEC = {
  scan: [['b', 0.2, 2.4, 0.2, 'R', -1.1, 1.2, 0], ['b', 0.2, 2.4, 0.2, 'R', 1.1, 1.2, 0], ['b', 2.6, 0.5, 1.2, 'D', 0, 2.5, 0], ['b', 1, 0.6, 0.8, 'W', 0, 0.4, 0]],
  shipments: [['b', 2.4, 1.5, 1.4, 'W', -0.4, 1.2, 0], ['b', 1, 1, 1.3, 'R', 1.3, 0.95, 0], ['s', 0.38, 'D', -1, 0.4, 0.75], ['s', 0.38, 'D', -1, 0.4, -0.75], ['s', 0.38, 'D', 0.9, 0.4, 0.75], ['s', 0.38, 'D', 0.9, 0.4, -0.75]],
  forward: [0, 1, 2, 3].map((index) => ['b', 0.8 + index * 0.15, 0.8 + index * 0.15, 0.8, index % 2 ? 'W' : 'R', -2.1 + index * 1.4, 0.6 + index * 0.08, 0]),
  backward: [0, 1, 2, 3].map((index) => ['b', 1.25 - index * 0.15, 1.25 - index * 0.15, 0.8, index % 2 ? 'R' : 'W', -2.1 + index * 1.4, 0.9 - index * 0.08, 0]),
  holds: [['b', 1.8, 1.4, 0.9, 'R', 0, 0.7, 0], ['b', 0.2, 0.9, 0.2, 'S', -0.55, 1.85, 0], ['b', 0.2, 0.9, 0.2, 'S', 0.55, 1.85, 0], ['b', 1.3, 0.2, 0.2, 'S', 0, 2.35, 0]],
  admin: [['b', 1.2, 1.2, 1.2, 'R', 0, 1.6, 0], ...ring(7, 2, (x, z) => ['b', 0.5, 0.5, 0.5, 'W', x, 1.6, z])],
}
function build(spec) {
  const group = new THREE.Group()
  spec.forEach((shape) => {
    let geometry; let materialKey; let position
    if (shape[0] === 'b') { geometry = new THREE.BoxGeometry(shape[1], shape[2], shape[3]); materialKey = shape[4]; position = shape.slice(5) }
    else if (shape[0] === 'c') { geometry = new THREE.CylinderGeometry(shape[1], shape[1], shape[2], 28); materialKey = shape[3]; position = shape.slice(4) }
    else { geometry = new THREE.SphereGeometry(shape[1], 18, 14); materialKey = shape[2]; position = shape.slice(3) }
    const mesh = new THREE.Mesh(geometry, MT[materialKey]); mesh.position.set(...position); mesh.castShadow = true; group.add(mesh)
  })
  return group
}
export default function Hub3D({ items = [], onOpen = () => {}, idle = false, height = '100%' }) {
  const box = useRef(null)
  useEffect(() => {
    const element = box.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.shadowMap.enabled = true; element.appendChild(renderer.domElement)
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a92, 0.95))
    const light = new THREE.DirectionalLight(0xffffff, 0.9); light.position.set(14, 26, 18); light.castShadow = true; scene.add(light)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.95 })); floor.rotation.x = -Math.PI / 2; scene.add(floor)
    const radius = Math.max(8, items.length * 1.35); const nodes = []
    items.forEach((page, index) => {
      const angle = index / Math.max(items.length, 1) * Math.PI * 2 - Math.PI / 2; const x = Math.cos(angle) * radius; const z = Math.sin(angle) * radius
      const group = new THREE.Group(); group.position.set(x, 0, z); group.userData.index = index
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.8, 0.25, 40), MT.W); base.position.y = 0.12; group.add(base)
      const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.07, 8, 60), material(0xd5001c, 0.4, 0.3)); ringMesh.rotation.x = Math.PI / 2; ringMesh.position.y = 0.27; group.add(ringMesh)
      const model = build(SPEC[page.id] || SPEC.admin); model.position.y = 0.25; group.add(model); scene.add(group); nodes.push({ group, model, x, z })
    })
    let frameId; let time = 0; let last = performance.now()
    const resize = () => { const width = element.clientWidth; const heightValue = element.clientHeight; renderer.setSize(width, heightValue); camera.aspect = width / heightValue; camera.updateProjectionMatrix() }
    const observer = new ResizeObserver(resize); observer.observe(element); resize()
    const frame = (now) => { const delta = Math.min((now - last) / 1000, 0.05); last = now; if (!reduce) time += delta; camera.position.set(0, radius * 1.05, radius * 1.7); camera.lookAt(0, 0, 0); nodes.forEach((node) => { if (!reduce) node.model.rotation.y = time * 0.5 }); renderer.render(scene, camera); frameId = requestAnimationFrame(frame) }
    frameId = requestAnimationFrame(frame)
    const click = (event) => { if (idle) return; const rect = renderer.domElement.getBoundingClientRect(); const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); const ray = new THREE.Raycaster(); ray.setFromCamera(pointer, camera); const hit = ray.intersectObjects(nodes.map((node) => node.group), true)[0]; let object = hit?.object; while (object && object.userData.index === undefined) object = object.parent; if (object) onOpen(items[object.userData.index]) }
    renderer.domElement.addEventListener('click', click)
    return () => { cancelAnimationFrame(frameId); observer.disconnect(); renderer.domElement.removeEventListener('click', click); renderer.dispose(); element.removeChild(renderer.domElement) }
  }, [items, onOpen, idle])
  return <div ref={box} className="hub" style={{ height }} role="group" aria-label="3D page switcher" />
}
