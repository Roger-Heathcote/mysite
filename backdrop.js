import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';
// import { THREE.EffectComposer } from 'https://unpkg.com/three@0.123.0/examples/js/postprocessing/BloomPass.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { EffectComposer } from 'https://unpkg.com/three@0.123.0/examples/jsm/postprocessing/EffectComposer.js';

function randIntRange(start, end) {
	return (Math.ceil((Math.random() * (end-start)))+start)
}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight )
}

function everyXFrames(callback, x=1){
	if(!x) callback()
	requestAnimationFrame( ()=>{
		everyXFrames(callback, x-1)
	})
}

function animate() {
	requestAnimationFrame(animate)
	// everyXFrames(animate, 1)
	rects.forEach(rect=>{
		rect.object.rotation.x = rect.object.rotation.x + rect.xRot
		rect.object.rotation.y = rect.object.rotation.y + rect.yRot
		rect.object.position.z = rect.object.position.z + rect.zSpeed
		if(rect.object.position.z > -1) rect.object.position.z = -FAR
		theGrid.position.z = theGrid.position.z + 0.00025
		if(theGrid.position.z>1) theGrid.position.z = 0
	})
	renderer.render( scene, camera )
}

// CHANGE COLORS
// CHANGE COLORS
// CHANGE COLORS
export function changeCols({themeName, bg, gr, fg, hl, pl}){
	console.log("Changing to theme:", themeName)

	console.log(gr.toString(16))

	rects.forEach(rect=>{
		rect.object.material.color.setHex(fg || 0x000000)
		rect.wireframe.material.color.setHex(hl || 0x000000)
	})

	// theGrid.material.color.setHex(gr)
	// theGrid.material.color.setHex(0xffffff)
	theGrid.material.color.setHex(gr)
	// theGrid.material.color.setHex(gr || 0x000000)
	centerLine.material.color.setHex(gr || 0x000000)
	scene.background = new THREE.Color( bg || 0x000000 )
	scene.fog = new THREE.Fog( bg || 0x000000, NEAR, FAR )
	plane.material.color.setHex(pl || 0x000000)
	plane.material.opacity = pl ? 1 : 0
}

// SCRIPT
// SCRIPT
// SCRIPT

const rootElem = document.querySelector("body")

// Scene
const NEAR = 0.2
const FAR = 95

const BOX_COL = 0xff5f00;
const GRID_COL = 0xff5f00;
const BG_COL = 0x361424
const scene = new THREE.Scene()
scene.background = new THREE.Color( BG_COL )
scene.fog = new THREE.Fog( BG_COL, NEAR, FAR )

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, NEAR, FAR)
camera.position.y = 2.5 // Also added at 0,0,0 by default so moved away by 5 units
camera.position.z = 0 // Also added at 0,0,0 by default so moved away by 5 units
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
  
// Renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize(window.innerWidth, window.innerHeight)
rootElem.appendChild(renderer.domElement)
window.addEventListener( 'resize', onWindowResize, false );

// Glow effect
// const composer = new EffectComposer( renderer );





// OBJECTS
// OBJECTS
// OBJECTS

// PLANE
var planeGeo = new THREE.PlaneBufferGeometry(100, 100, 8, 8);
var planeMat = new THREE.MeshBasicMaterial({ color: 0xf0f000, side: THREE.DoubleSide });
var plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotateX( - Math.PI / 2);
plane.translateY(-1)
plane.material.transparent = true
plane.material.opacity = 0
scene.add(plane);


// GRID
const size = 100;
const gridPoints = []
const lineStart = -(size/2)
const lineEnd = size/2
for(let x=lineStart; x<lineEnd; x++){
	gridPoints.push( new THREE.Vector3(lineStart, 0, x) )
	gridPoints.push( new THREE.Vector3(lineEnd, 0, x) )
	gridPoints.push( new THREE.Vector3(lineStart, 0, x) )
}
for(let x=lineStart; x<lineEnd; x++){
	gridPoints.push( new THREE.Vector3(x, 0, lineStart) )
	gridPoints.push( new THREE.Vector3(x, 0, lineEnd) )
	gridPoints.push( new THREE.Vector3(x, 0, lineStart) )
}
const gridGeo = new THREE.BufferGeometry().setFromPoints( gridPoints )
const theGrid = new THREE.Line( gridGeo, new THREE.LineBasicMaterial({ color: GRID_COL }) )
scene.add(theGrid)



// CENTER LINE
const centerLinePoints = [ new THREE.Vector3(0, 0, -50), new THREE.Vector3(0, 0.1, 50) ]
const centerLineGeo = new THREE.BufferGeometry().setFromPoints( centerLinePoints )
const centerLine = new THREE.Line( centerLineGeo, new THREE.LineBasicMaterial({ color: GRID_COL }) )
scene.add(centerLine)


// CREATE RECTANGLES
const rects = []
const _ = [... Array(200)].map(()=>{

	const dist = randIntRange(FAR,FAR*2)
	const xTrans = randIntRange(-4*(dist/3)/3,4*(dist/3)/3)
	const yTrans = randIntRange(2,2*(dist/3)/4)
	if(xTrans < 3 && xTrans > -3 && yTrans < 5) return (console.log("Skipped one"))

	// console.log("Making rects")
	const boxGeometry = new THREE.BoxGeometry(
		randIntRange(10,50) / 15,
		randIntRange(10,50) / 15,
		randIntRange(10,30) / 15
	)
	boxGeometry.center()
	
	const boxMaterial = new THREE.MeshBasicMaterial({
		color: 0x111111,
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value pushes polygon further away
		polygonOffsetUnits: 1
	})
	const cube = new THREE.Mesh( boxGeometry, boxMaterial )

	// const lineColor = new THREE.Color(`hsl(${randIntRange(0,359)}, 100%, 50%)`)

	const geo = new THREE.EdgesGeometry( cube.geometry ) // or WireframeGeometry
	const mat = new THREE.LineBasicMaterial( { color: BOX_COL  } )
	const wireframe = new THREE.LineSegments( geo, mat )
	cube.add( wireframe )

	// Move them about
	cube.translateZ(-dist)
	cube.translateX(xTrans)
	cube.translateY(yTrans)

	cube.rotation.x = Math.PI * randIntRange(10,50) / 10 
	cube.rotation.y = Math.PI * randIntRange(10,50) / 10 
	cube.rotation.z = Math.PI * randIntRange(10,50) / 10 

	rects.push({
		object: cube,
		wireframe: wireframe,
		xRot: randIntRange(-20,20) / 500,
		yRot: randIntRange(-20,20) / 500,
		zRot: randIntRange(-20,20) / 500,
		zSpeed: randIntRange(1,50) / 100
	})
	scene.add(cube)
})

animate()