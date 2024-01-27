var container;
var camera, scene, renderer;
var mouseX = 0,
  mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Object3D ("Group") nodes and Mesh nodes

const light = new THREE.PointLight(0xffffff, 1, 100);
const ambientLight = new THREE.AmbientLight(0x202020);

var sceneRoot = new THREE.Group();
var viewRoot = new THREE.Group();

var SunMesh;
var sunSpin = new THREE.Group();

var earthMesh;
var earthOrbit = new THREE.Group();
var earthTrans = new THREE.Group();
var earthTilt = new THREE.Group();
var earthSpin = new THREE.Group();

var moonMesh;
var moonTilt = new THREE.Group();
var moonSpin = new THREE.Group();
var moonOrbit = new THREE.Group();
var moonTrans = new THREE.Group();

var neptuneMesh;
var neptuneTilt = new THREE.Group();
var neptuneSpin = new THREE.Group();
var neptuneOrbit = new THREE.Group();
var neptuneTrans = new THREE.Group();

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

  sceneRoot.add(viewRoot);

  // View node
  scene.add(viewRoot);

  // LOOK INTO THE SUN
  viewRoot.add(sunSpin);
  sunSpin.add(SunMesh);
  SunMesh.add(ambientLight);
  SunMesh.add(light);

  // Neptune
  neptuneTrans.position.x = 7.5;
  neptuneTilt.rotation.z = 0.0;

  viewRoot.add(neptuneOrbit);
  neptuneOrbit.add(neptuneTrans);
  neptuneTrans.add(neptuneTilt);
  neptuneTilt.add(neptuneSpin);
  neptuneSpin.add(neptuneMesh);

  // earth branch
  earthTrans.position.x = 3.8;
  earthTilt.rotation.z = -0.409105;

  viewRoot.add(earthOrbit);
  earthOrbit.add(earthTrans);
  earthTrans.add(earthTilt);
  earthTilt.add(earthSpin);
  earthSpin.add(earthMesh);

  // DA MOON
  moonTilt.rotation.z = 5 / (2 * Math.PI);
  moonTrans.position.x = -1.0;

  earthTrans.add(moonOrbit);
  moonOrbit.add(moonTrans);
  moonTrans.add(moonTilt);
  moonTilt.add(moonSpin);
  moonSpin.add(moonMesh);
}

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 1;

  var texloader = new THREE.TextureLoader();

  // Earth mesh
  //var geometryEarth = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
  var geometryEarth = new THREE.SphereGeometry(0.5, 32, 32);
  var materialEarth = new THREE.MeshLambertMaterial();

  materialEarth.combine = 0;
  materialEarth.needsUpdate = true;
  materialEarth.wireframe = false;

  const earthTexture = texloader.load("tex/2k_earth_daymap.jpg");
  materialEarth.map = earthTexture;

  // Moon mesh
  var geometryMoon = new THREE.SphereGeometry(0.2, 32, 32);
  var materialMoon = new THREE.MeshLambertMaterial();

  materialMoon.combine = 0;
  materialMoon.needsUpdate = true;
  materialMoon.wireframe = false;

  const moonTexture = texloader.load("tex/2k_moon.jpg");
  materialMoon.map = moonTexture;

  // Sun mesh
  var geometrySun = new THREE.SphereGeometry(2, 64, 64);
  var materialSun = new THREE.MeshBasicMaterial();

  materialSun.combine = 0;
  materialSun.needsUpdate = true;
  materialSun.wireframe = false;

  const sunTexture = texloader.load("tex/2k_sun.jpg");
  materialSun.map = sunTexture;

  // Neptune mesh
  var geometryNeptune = new THREE.SphereGeometry(1.0, 32, 32);
  var materialNeptune = new THREE.MeshLambertMaterial();

  materialNeptune.combine = 0;
  materialNeptune.needsUpdate = true;
  materialNeptune.wireframe = false;

  const neptuneTexture = texloader.load("tex/2k_neptune.jpg");
  materialNeptune.map = neptuneTexture;

  // Task 7: material using custom Vertex Shader and Fragment Shader
  var uniforms = THREE.UniformsUtils.merge([
    {
      colorTexture: { value: new THREE.Texture() },
      specularMap: { value: new THREE.Texture() },
    },
    THREE.UniformsLib["lights"],
  ]);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent.trim(),
    fragmentShader: document
      .getElementById("fragmentShader")
      .textContent.trim(),
    lights: true,
  });
  shaderMaterial.uniforms.colorTexture.value = earthTexture;

  const specularMap = texloader.load("tex/2k_earth_specular_map.jpg");
  shaderMaterial.uniforms.specularMap.value = specularMap;

  earthMesh = new THREE.Mesh(geometryEarth, shaderMaterial);
  moonMesh = new THREE.Mesh(geometryMoon, materialMoon);
  SunMesh = new THREE.Mesh(geometrySun, materialSun);
  neptuneMesh = new THREE.Mesh(geometryNeptune, materialNeptune);

  createSceneGraph();

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);

  var checkBoxAnim = document.getElementById("animation");
  animation = checkBoxAnim.checked;
  checkBoxAnim.addEventListener("change", (event) => {
    animation = event.target.checked;
  });

  var checkBoxWireframe = document.getElementById("wireframe");
  earthMesh.material.wireframe = checkBoxWireframe.checked;
  checkBoxWireframe.addEventListener("change", (event) => {
    earthMesh.material.wireframe = event.target.checked;
    moonMesh.material.wireframe = event.target.checked;
    SunMesh.material.wireframe = event.target.checked;
    neptuneMesh.material.wireframe = event.target.checked;
  });
}

function render() {
  // Set up the camera
  camera.position.x = mouseX * 10;
  camera.position.y = -mouseY * 10;
  camera.lookAt(scene.position);

  // Perform animations
  if (animation) {
    // 6 = 360/60
    // 6 / 27.3 = 1 orbit per 27.3 seconds
    sunSpin.rotation.y += (360 / 60) * (1 / 25) * (Math.PI / 180);

    //earthSpin.rotation.y += (24 / 60) * (Math.PI / 180);
    //earthOrbit.rotation.y += (6 / 365) * (Math.PI / 180);
    //earthOrbit.rotation.y += (365 / (360 / 60)) * (PI / 180);
    //earthOrbit.rotation.y += (365 / 360 / 60) * (Math.PI / 180);
    //earthOrbit.rotation.y += 1 / 365; //1 orbit per 365 days

    earthOrbit.rotation.y += (360 / 60) * (1 / 365) * (Math.PI / 180);
    earthSpin.rotation.y += 0.01;

    moonOrbit.rotation.y += (-6 / 27.3) * (Math.PI / 180);
    //moonSpin.rotation.y += (365 / 360 / 60) * (Math.PI / 180);
    moonSpin.rotation.y += (360 / 60) * (1 / 27.3) * (Math.PI / 180);

    neptuneOrbit.rotation.y += 0.02 / 365;
    neptuneSpin.rotation.y += 0.01;
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