var container;
var camera, scene, renderer;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Object3D ("Group") nodes and Mesh nodes
var sceneRoot = new THREE.Group();
var earthSpin = new THREE.Group();
var earthMesh;

var animation = true;

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    // mouseX, mouseY are in the range [-1, 1]
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function createSceneGraph() {
    scene = new THREE.Scene();

    // Top-level node
    scene.add(sceneRoot);
    // earth branch
    sceneRoot.add(earthSpin);
    earthSpin.add(earthMesh);
}

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    
    var texloader = new THREE.TextureLoader();
    
    // Earth mesh
	var geometryEarth = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);    

    var materialEarth = new THREE.MeshBasicMaterial();
    materialEarth.combine = 0;
    materialEarth.needsUpdate = true;
    materialEarth.wireframe = false;    
    //
    // Task 2: uncommenting the following two lines requires you to run this example with a (local) webserver
    //
    // For example using python:
    //    1. open a command line and go to the lab folder
    //    2. run "python -m http.server"
    //    3. open your browser and go to http://localhost:8000
    //
    // see https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally
    //
    /*
	const earthTexture = texloader.load('tex/2k_earth_daymap.jpg');
    materialEarth.map = earthTexture;
    */

    // Task 7: material using custom Vertex Shader and Fragment Shader
    /*
	var uniforms = THREE.UniformsUtils.merge( [
	    { 
	    	colorTexture : { value : new THREE.Texture() }
    	},
	    THREE.UniformsLib[ "lights" ]
	] );

	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		vertexShader : document.getElementById('vertexShader').textContent.trim(),
		fragmentShader : document.getElementById('fragmentShader').textContent.trim(),
		lights : true
	});
	shaderMaterial.uniforms.colorTexture.value = earthTexture;
	*/

    earthMesh = new THREE.Mesh(geometryEarth, materialEarth);

    createSceneGraph();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    var checkBoxAnim = document.getElementById('animation');
    animation = checkBoxAnim.checked;
    checkBoxAnim.addEventListener('change', (event) => {
    	animation = event.target.checked;
    });

	var checkBoxWireframe = document.getElementById('wireframe');
    earthMesh.material.wireframe = checkBoxWireframe.checked;
    checkBoxWireframe.addEventListener('change', (event) => {
    	earthMesh.material.wireframe = event.target.checked;
    });
}

function render() {
    // Set up the camera
    camera.position.x = mouseX * 10;
    camera.position.y = -mouseY * 10;
    camera.lookAt(scene.position);

    // Perform animations
    if (animation) {
    	earthSpin.rotation.y += 0.01;
    }

    // Render the scene
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate); // Request to be called again for next frame
    render();
}

init(); // Set up the scene
animate(); // Enter an infinite loop
