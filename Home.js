
/*----------------------------3D Model----------------------------*/

const THREE = window.THREE;

// Create a scene
const scene = new THREE.Scene();

// Create a renderer
const rendererWidth = 1000; // Set the width of the renderer
const rendererHeight = 600; // Set the height of the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(rendererWidth, rendererHeight);
document.body.appendChild(renderer.domElement);

const canvasContainer = document.getElementById('canvasContainer');
canvasContainer.appendChild(renderer.domElement);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.1, 1000);
camera.position.set(0, 560, -100);
 camera.lookAt(0, 0, 0); // 设置相机的视点
scene.add(camera);

// Create OrbitControls to enable user interaction with the scene
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Add ambient light
let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
let directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 4.5, -10);
scene.add(directionalLight);

// Set background color
scene.background = new THREE.Color(0.949, 0.953, 0.969);

let meshes = [];  // 用来保存模型的所有Mesh的数组

// Create a texture loader
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./plesiosaur/textures/material_0_baseColor.jpeg', function (texture) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
});

// Create a GLTF loader
const loader = new THREE.GLTFLoader();
loader.load(
  "./plesiosaur/scene.gltf",

  // onLoad callback
  function (gltf) {
    gltf.scene.position.set(0, -200, 0);
    gltf.scene.scale.set(0.24, 0.24, 0.24); // 调整模型大小
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({ map: texture });
        meshes.push(o);
      }
    });
    scene.add(gltf.scene);
  },
  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },

  // onError callback
  function (error) {
    console.log("An error occurred while loading the model");
  }
);

function animate() {
  controls.update();

  TWEEN.update();

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
/*----------------------------Timer----------------------------*/
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const goBtn = document.getElementById('goBtn');
const noBtn1 = document.getElementById('noBtn1');
const noBtn2 = document.getElementById('noBtn2');
const yesBtn = document.getElementById('yesBtn');
const message1Div = document.getElementById('message1');
const message2Div = document.getElementById('message2');

let startTime = 0;
let endTime = 0;
let totalElapsedTime = 0;
let elapsedTime = 0;
let intervalId;
let isTimerRunning = false;

// click start
function startTimer() {

  if (!isTimerRunning) {
    startTime = new Date().getTime();
    console.log("startTime", startTime);
    intervalId = setInterval(updateTimer, 1000);
    console.log("intervalIdstart", intervalId);
    isTimerRunning = true;
  }
}

// click stop
function stopTimer() {
  if (isTimerRunning) {
    clearInterval(intervalId);
    console.log("intervalIdstop", intervalId);
    endTime = new Date().getTime();
    console.log("endTime", endTime);
    compareDuration();
    isTimerRunning = false;
  }

}
function handleYes() {
  startTime = new Date().getTime() - elapsedTime; // 根据已经过去的时间更新startTime
  intervalId = setInterval(updateTimer, 1000);
  console.log("intervalIdyes", intervalId);
  console.log("startTime2", startTime);
  hideMessage(message2Div);
  isTimerRunning = true;
}
// update timer
function updateTimer() {

  const currentTime = new Date().getTime();
  elapsedTime = currentTime - startTime;
  console.log("elapsedTime", elapsedTime);

  let seconds = Math.floor(elapsedTime / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  timerElement.textContent = padNumber(hours) + ':' + padNumber(minutes) + ':' + padNumber(seconds);
}

function compareDuration() {
  const suggestedDuration = document.querySelector('.sgst').innerText.split(':');
  const suggestedMilliseconds = parseInt(suggestedDuration[0]) * 3600000 + parseInt(suggestedDuration[1]) * 60000 + parseInt(suggestedDuration[2]) * 1000;


  if (elapsedTime >= suggestedMilliseconds) {
    showMessage(message1Div);
  } else {
    showMessage(message2Div);
  }
}

function showMessage(messageDiv) {
  messageDiv.classList.remove('hidden');
}

let lastColoredMeshIndex = -1;  // 初始化为-1表示没有Mesh被上色过

function handleGo() {
  hideMessage(message1Div);
  hideMessage(message2Div);

  const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
  const randomMaterial = new THREE.MeshStandardMaterial({ color: randomColor, transparent: true, opacity: 0.8 });
  
  // 选择一个新的Mesh进行上色，确保它不同于上次上色的Mesh
  let randomMeshIndex;
  do {
    randomMeshIndex = Math.floor(Math.random() * meshes.length);
  } while(randomMeshIndex == lastColoredMeshIndex && meshes.length > 1);
  
  meshes[randomMeshIndex].material = randomMaterial;
  
  lastColoredMeshIndex = randomMeshIndex;  // 更新上次上色的Mesh的索引
  

  const changedPart = meshes[randomMeshIndex];
  changedPart.geometry.computeBoundingBox();
  const box = changedPart.geometry.boundingBox;
  const center = box.getCenter(new THREE.Vector3());

  // 计算从改变颜色部分的中心到相机的方向
  const direction = center.clone().sub(camera.position).normalize();
  
  // 设置新的相机位置，使其位于改变颜色部分的正前方，并保持一个适当的距离
  const distanceZ = 20;
  const newPosition = new THREE.Vector3(center.x, center.y, center.z - distanceZ);
  const newSize = box.getSize(new THREE.Vector3());
  const newDistance = newSize.length()*0.35;
  //const newPosition = center.clone().sub(direction.multiplyScalar(newDistance));
  if (newPosition.z > camera.position.z) {
    newPosition.z = camera.position.z;
  }
  
  // Create a tween to move the camera to the new position
  const originalCameraPosition = camera.position.clone();
  const originalCameraTarget = controls.target.clone();

  // 创建一个动画，使相机平滑地移动到新的位置
  // 创建一个动画，使相机平滑地移动到新的位置
controls.target = center;  // 在动画开始前设置目标

const tween = new TWEEN.Tween(camera.position)
  .to(newPosition, 2000)  // 在 2000 毫秒内完成动画
  .easing(TWEEN.Easing.Quadratic.InOut)  // 使用 InOut easing
  .onUpdate(() => {
    camera.lookAt(controls.target);  // 在每一帧中，使相机看向 target（即模型的中心）
  })
  .onComplete(() => {
    // 当动画完成时，创建一个新的动画使相机平滑地返回原来的位置
    const tweenBack = new TWEEN.Tween(camera.position)
      .to(originalCameraPosition, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        controls.target = originalCameraTarget;  // 使相机看向原来的目标
      })
      .start();
  })
  .start();



  handleNo();
  // startTimer();
}

function handleNo() {
  clearInterval(intervalId);
  hideMessage(message1Div);
  hideMessage(message2Div);
  timerElement.textContent = '00:00:00';
}



function hideMessage(messageDiv) {
  messageDiv.classList.add('hidden');
}

function padNumber(number) {
  return number.toString().padStart(2, '0');
}

// Initial setup
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);

noBtn1.addEventListener('click', handleNo);
noBtn2.addEventListener('click', handleNo);
//noBtn.addEventListener('click', handleNo);
yesBtn.addEventListener('click', handleYes);
goBtn.addEventListener('click', handleGo);
// Hide messages initially
hideMessage(message1Div);
hideMessage(message2Div);
