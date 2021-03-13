window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000  });
const cube2 = new THREE.Mesh(geometry, material2);
scene.add(cube2);

camera.position.z = 5;

function draw(deltaTime) { 
    cube.rotation.y  += 1.5 * deltaTime;
    cube.rotation.x  += 1.5 * deltaTime;
    cube2.rotation.x -= 1.5 * deltaTime;
    cube2.rotation.y -= 1.5 * deltaTime;

    renderer.render(scene, camera);
};


let deltaTimeThen = 0;
function __draw(deltaTimeNow) {    
    deltaTimeNow *= 0.001;

    const deltaTime = deltaTimeNow - deltaTimeThen;
    deltaTimeThen = deltaTimeNow;

    draw(deltaTime);
    requestAnimationFrame(__draw); 
}
requestAnimationFrame(__draw); 