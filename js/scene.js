
// Global setting
let divID = "visual";

let width = document.getElementById(divID).offsetWidth;
let height = 600;
let background = '#000000';
let alpha = 1.0;

let intensity = 0.66;

// Global variables
let scene, camera, renderer, directionalLight;
let cameraControls;

setup();
draw();

function setup(){
    // Create global scene
    scene = new THREE.Scene();

    // Create the canvas to render
    renderer = new THREE.WebGLRenderer({
      antialias : true,
      alpha: true
    });
    renderer.setClearColor(parseInt(background.replace('#', '0x'), 16), alpha);
    renderer.sortObjects = false;
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    renderer.autoClear = false;


    // Create the global camera
    camera = new THREE.PerspectiveCamera(40, width / height);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 5;
    scene.add(camera);

    // Add camera control
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add grid
    const size = 10;
    const divisions = 10;

    let grid = new THREE.GridHelper( size, divisions );
    scene.add(grid);

    // Add main axis
    let axesHelper = new THREE.AxesHelper(3);
    axesHelper.material.linewidth = 3;
    scene.add( axesHelper );

    // Add the renderer to the page
    document.getElementById(divID).appendChild(renderer.domElement);
}

function draw(){

    // update the controls
    cameraControls.update();

    // set the scene
    // renderer.clear(true, true, true);
    renderer.render(scene, camera);

    // draw the frame
    requestAnimationFrame(draw);
}
