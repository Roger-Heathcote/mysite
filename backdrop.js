import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';

function randIntRange(start, end) {
	return (Math.ceil((Math.random() * (end-start)))+start)
}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight )
}

function animate() {
	requestAnimationFrame(animate)
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
	rects.forEach(rect=>{
		rect.object.material.color.setHex(fg || 0x000000)
		rect.wireframe.material.color.setHex(hl || 0x000000)
	})
	theGrid.material.color.setHex(gr)
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
const FAR = 80

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
const canvas = document.querySelector("canvas")
canvas.setAttribute('alt', '3D animated backdrop - decorative - flying over an abstract geometrical plane, through a cloud of spinning cuboids.')
window.addEventListener( 'resize', onWindowResize, false );


// OBJECTS
// OBJECTS
// OBJECTS

// Plane
var planeGeo = new THREE.PlaneBufferGeometry(100, 100, 8, 8);
var planeMat = new THREE.MeshBasicMaterial({ color: 0xf0f000, side: THREE.DoubleSide })
var plane = new THREE.Mesh(planeGeo, planeMat)
plane.rotateX( - Math.PI / 2)
plane.translateY(-1)
plane.material.transparent = true
plane.material.opacity = 0
scene.add(plane);

// Grid
// threejs grid helper had color matching issues so we hand roll a grid. 
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

// Center line - needed to prevent flicker when plane is visible
const centerLinePoints = [ new THREE.Vector3(0, 0, -50), new THREE.Vector3(0, 0.1, 50) ]
const centerLineGeo = new THREE.BufferGeometry().setFromPoints( centerLinePoints )
const centerLine = new THREE.Line( centerLineGeo, new THREE.LineBasicMaterial({ color: GRID_COL }) )
scene.add(centerLine)

// 200 Cuboids
const rects = []
const _ = [... Array(200)].map(()=>{

	// Set distance - cuboids start a random disance behind the fog
	const dist = randIntRange(FAR,FAR*2)

	// Set how far left/right the cuboids are
	const xTrans = randIntRange(-4*(dist/3)/3,4*(dist/3)/3)

	// Set height - Minimum distance from plane/grid is 2
	const yTrans = randIntRange(2,2*(dist/3)/4)

	// Abort if the cuboid is on a collision course with the camera
	if(xTrans < 3 && xTrans > -3 && yTrans < 5) return

	const boxGeometry = new THREE.BoxGeometry(
		randIntRange(10,50) / 15,
		randIntRange(10,50) / 15,
		randIntRange(10,30) / 15
	)
	boxGeometry.center()
	
	// Make solid cuboid
	// We shrink it bit so it doesn't fight with the wireframe 
	const boxMaterial = new THREE.MeshBasicMaterial({
		polygonOffset: true,
		polygonOffsetFactor: 1, // positive value push polygon further away
		polygonOffsetUnits: 1
	})
	const cube = new THREE.Mesh( boxGeometry, boxMaterial )

	// Make wireframe and attach it to cuboid
	const wfGeo = new THREE.EdgesGeometry( cube.geometry ) // or WireframeGeometry
	const wfMat = new THREE.LineBasicMaterial( { color: BOX_COL  } )
	const wireframe = new THREE.LineSegments( wfGeo, wfMat )
	cube.add( wireframe )

	// Move cuboids into place
	cube.translateZ(-dist)
	cube.translateX(xTrans)
	cube.translateY(yTrans)
	cube.rotation.x = Math.PI * randIntRange(10,50) / 10 
	cube.rotation.y = Math.PI * randIntRange(10,50) / 10 
	cube.rotation.z = Math.PI * randIntRange(10,50) / 10 

	// Push cuboid, wireframe onto list and give them rotation and speed factors
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