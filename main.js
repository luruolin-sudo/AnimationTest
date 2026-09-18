import * as THREE from "./libs/three.module.js";
import { GLTFLoader } from "./libs/GLTFLoader.js";
import { OrbitControls } from "./libs/OrbitControls.js";
import { EXRLoader } from "./libs/EXRLoader.js";

// ======================================================
// 基本設定
// ======================================================

const settings = {
  rotateSpeed: 0,
  ambientIntensity: 1
};


// ======================================================
// 建立場景
// ======================================================

const scene = new THREE.Scene();


// ======================================================
// Renderer
// ======================================================

const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

document.body.appendChild(
  renderer.domElement
);


// ======================================================
// 曝光
// ======================================================

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 0.85;


// ======================================================
// Camera
// ======================================================

const camera =
  new THREE.PerspectiveCamera(
    45,
    window.innerWidth /
      window.innerHeight,
    0.1,
    100
  );


const isMobile =
  window.innerWidth <= 768;


const cameraZ =
  isMobile ? 3.0 : 0.9;

const cameraY = -0.15;
const cameraX = -0.3;


camera.position.set(
  cameraX,
  cameraY,
  cameraZ
);

camera.lookAt(
  0,
  0,
  0
);


// ======================================================
// OrbitControls
// ======================================================

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.minDistance = 1;

controls.maxDistance = 10;


// ======================================================
// 環境光
// ======================================================

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    settings.ambientIntensity
  );

scene.add(
  ambientLight
);


// ======================================================
// 滑桿
// ======================================================

document
  .getElementById("rotateSpeed")
  .addEventListener(
    "input",
    (event) => {

      settings.rotateSpeed =
        parseFloat(
          event.target.value
        );

    }
  );


document
  .getElementById("ambientIntensity")
  .addEventListener(
    "input",
    (event) => {

      const value =
        parseFloat(
          event.target.value
        );

      ambientLight.intensity =
        value;

      renderer.toneMappingExposure =
        value;

    }
  );


document
  .getElementById("cameraFov")
  .addEventListener(
    "input",
    (event) => {

      camera.fov =
        parseFloat(
          event.target.value
        );

      camera.updateProjectionMatrix();

    }
  );


// ======================================================
// HDR / EXR
// ======================================================

const pmremGenerator =
  new THREE.PMREMGenerator(
    renderer
  );

pmremGenerator
  .compileEquirectangularShader();


new EXRLoader()
  .setPath("./hdr/")
  .load(
    "lebombo.exr",
    function (texture) {

      const envMap =
        pmremGenerator
          .fromEquirectangular(
            texture
          )
          .texture;

      scene.environment =
        envMap;

// 背景使用指定色碼
scene.background = new THREE.Color("#1f313f");

      texture.dispose();

      pmremGenerator.dispose();

    }
  );


// ======================================================
// GLB 模型
// ======================================================

let currentModel = null;


function loadModel() {

  const loader =
    new GLTFLoader();


  loader.load(
    "https://dl.dropboxusercontent.com/scl/fi/mvlbu6mcuynvzryx5fq5i/office.glb?rlkey=c7k5mk0h6p6qmkc0i60ywppwa&dl=1",

    (gltf) => {

      currentModel =
        gltf.scene;


      currentModel.position.set(
        1.5,
        0,
        0
      );


      currentModel.rotation.set(
        0,
        0,
        0
      );


      scene.add(
        currentModel
      );

    },

    undefined,

    (error) => {

      console.error(
        "GLB 載入失敗：",
        error
      );

    }
  );

}


loadModel();


// ======================================================
// 左側標題展開 / 收合
// ======================================================

const infoItems =
  document.querySelectorAll(
    ".info-item"
  );


infoItems.forEach(
  (item) => {

    const button =
      item.querySelector(
        ".info-title"
      );

    const icon =
      item.querySelector(
        ".title-icon"
      );


    button.addEventListener(
      "click",
      () => {

        const isActive =
          item.classList.contains(
            "active"
          );


        // 全部關閉
        infoItems.forEach(
          (otherItem) => {

            otherItem.classList.remove(
              "active"
            );

            const otherIcon =
              otherItem.querySelector(
                ".title-icon"
              );

            otherIcon.textContent =
              "＋";

          }
        );


        // 如果原本是關閉
        // 就打開它
        if (!isActive) {

          item.classList.add(
            "active"
          );

          icon.textContent =
            "−";

        }

      }
    );

  }
);


// ======================================================
// 頁面圓點
// ======================================================

const pageDots =
  document.querySelectorAll(
    ".page-dot"
  );


pageDots.forEach(
  (dot) => {

    dot.addEventListener(
      "click",
      () => {

        pageDots.forEach(
          (d) =>
            d.classList.remove(
              "active"
            )
        );


        dot.classList.add(
          "active"
        );

      }
    );

  }
);


// ======================================================
// 視窗縮放
// ======================================================

window.addEventListener(
  "resize",
  () => {

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );


    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();

  }
);


// ======================================================
// Animation Loop
// ======================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  if (currentModel) {

    currentModel.rotation.y +=
      settings.rotateSpeed;

  }


  controls.update();

  renderer.render(
    scene,
    camera
  );

}


animate();