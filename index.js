// Uncomment this line to lose the eyecandy and ace the lighthouse tests!
import {changeCols} from './backdrop.js'
import themes from './themes.js'

// DOM nodes
const timeSlotNode = document.querySelector(".time-slot")
const cmdLineNode = document.querySelector(".command-line")
const cursorNode = document.querySelector(".cursor")
const displayBackNode = document.getElementById("back")
const page = document.querySelector(".page")
const themeSelector = document.getElementById("themeSelector")

// Datas
let internalHistory = []
const cmdLine = []
const routes = {
	0: "main",
	B: "main",
	1: "made",
	2: "jobs",
	3: "know",
	4: "employers",
	5: "interests",
	6: "contact"
}

// EVENT LISTENERS
// EVENT LISTENERS
// EVENT LISTENERS

window.addEventListener('resize', resizer)

window.addEventListener('change', (event)=>{
		const theme = event.target.value
		themeSelector.selectedIndex = 0
		console.log("Switching theme to", theme)
		setTheme(theme)
})

window.addEventListener("keydown", handleKeys)
window.addEventListener("popstate", event => {
	event.preventDefault()
	internalHistory.pop()
	internalHistory.length === 0 ? history.back() : history.go(0)
})
const allLinks = document.querySelectorAll('a')
allLinks.forEach( (link)=> {
	link.addEventListener("click", linkClickHandler)
} )


// TIMERS
// TIMERS
// TIMERS

setInterval(putTime, 200)
setInterval(blinkCursor, 500)


// MAIN
// MAIN
// MAIN

// If URL contains an internal link then go to that, otherwise show the main screen
const link = internalLink(window.location.href) || "main"
setTheme("Vaporwave")
displayScreen(link)
unhideCommandLine()


// FUNCTIONS
// FUNCTIONS
// FUNCTIONS

// Update the time
function putTime() {
	const time = new Date().toTimeString().replace("+0000 (Greenwich Mean Time)", "")
	timeSlotNode.textContent = time
}

// Blink the cursor
function blinkCursor() {
	cursorNode.classList.toggle("hide")
}

// Check if a link is within this page or not
function internalLink(url) {
	const match = url.match(/#([a-zA-Z0-9_]{1,20})/)
	return match && match[1]
}

function unhideCommandLine() {
	const elem = document.getElementById("commandLineBox")
	elem.removeAttribute("hidden")
}

function displayBack(yes) {
	if (yes) return displayBackNode.classList.add("display-back")
	displayBackNode.classList.remove("display-back")
}

// Display the screen with the specified class name
function displayScreen(pageClass) {
	displayBack(pageClass !== "main")
	const nextScreen = document.querySelector(`.${pageClass}`)
	history.pushState(null, null, `/#${pageClass}`)
	if (nextScreen) {
		internalHistory.push(1)
		const screens = document.querySelectorAll(".terminal section")
		screens.forEach(screen => screen.classList.remove("active"))
		nextScreen.classList.add("active")
	} else {
		displayScreen("main")
	}
	resizer()
}

// Execute commands
function execute(cmd) {
	if (cmd.toUpperCase() === "B") {
		internalHistory = []
		console.log("internalHistory length:", internalHistory)
	}
	if (routes[cmd]) displayScreen(routes[cmd])
	cmdLine.length = 0
}

// Handle keyboard input
function handleKeys(event) {
	if (event.key.length === 1) {
		cmdLine.push(event.key)
	} else {
		if (event.key === "Backspace" && cmdLine.length > 0)
			cmdLine.pop()
		if (event.key === "Enter")
			execute(cmdLine.join("").toUpperCase())
	}
	cmdLineNode.textContent = "> " + cmdLine.join("")
}

// Catch internal links and change "screen" accordingly
function linkClickHandler(event){
	if (internalLink(event.currentTarget.href)) {
		event.preventDefault()
		displayScreen(internalLink(event.currentTarget.href))
	}
}

function setTheme(themeName){
	if(!themes[themeName]) return console.log(`Bad theme:${themeName}`)
	const theme = themes[themeName]
	let root = document.documentElement
	root.style.setProperty('--terminal-color',theme.term)
	root.style.setProperty('--icon-color', theme.icons || "")
	root.style.setProperty('--icon-bar-color', theme.bar || "")
	if(typeof changeCols !== 'undefined') changeCols(theme)
}

// If content smaller than screen height expand so icon bar at bottom
function resizer(){
	if(window.innerWidth<800 && (page.scrollHeight <= window.innerHeight)){
			page.style.height = `${window.innerHeight}px`
	} else {
		page.style.height = ""
	}        
}