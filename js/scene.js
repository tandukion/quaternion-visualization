
// Global setting
let divID = "visual";

let width = document.getElementById(divID).offsetWidth;
let height = 600;
let background = '#000000';
let alpha = 1.0;

let intensity = 0.66;

// Global variables
let scene, camera, renderer, directionalLight;
let cameraControls, grid, axesHelper;
let lineWidth = 3;
let lineLength = 3;

// World orientation offset, to make it easier to view
let worldQuaternion = new THREE.Quaternion();
worldQuaternion.set(0.0, 0.0, 0.0, 1);

// Arrow visual for the orientation
let arrowLine;
let arrowQuaternion = new THREE.Quaternion();
arrowQuaternion.set(0.0, 0.0, 0.0, 1);

let eVector;

$(document).ready(function() {
    setupViewer();
    drawViewer();

    setupSettings();
});

function setupViewer(){
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

    grid = new THREE.GridHelper( size, divisions );
    scene.add(grid);

    // Add main axis
    axesHelper = new THREE.AxesHelper(lineLength);
    axesHelper.material.linewidth = lineWidth;
    scene.add( axesHelper );

    // Create the arrow for the given orientation
    arrowLine = new THREE.Group();
    const material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: lineWidth});
    let geometry1 = new THREE.Geometry();
    geometry1.vertices.push(
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( lineLength, 0, 0 )
    );
    let geometry2 = new THREE.Geometry();
    geometry2.vertices.push(
        new THREE.Vector3( lineLength, 0, 0 ),
        new THREE.Vector3( lineLength-0.5, 0.5, 0 )
    );
    let line1 = new THREE.Line(geometry1, material);
    let line2 = new THREE.Line(geometry2, material);
    arrowLine.add(line1);
    arrowLine.add(line2);
    arrowLine.applyQuaternion(arrowQuaternion);
    scene.add(arrowLine);

    // Rotate the world to make it easier to view
    axesHelper.applyQuaternion(worldQuaternion);

    // Add the renderer to the page
    document.getElementById(divID).appendChild(renderer.domElement);
}

function drawViewer(){

    // update the controls
    cameraControls.update();

    // set the scene
    // renderer.clear(true, true, true);
    renderer.render(scene, camera);

    // draw the frame
    requestAnimationFrame(drawViewer);
}

function setupSettings() {
    let w = $('#quaternion-w-value').val();
    let x = $('#quaternion-x-value').val();
    let y = $('#quaternion-y-value').val();
    let z = $('#quaternion-z-value').val();

    // Set the value based on range inputs
    const input_names = ['#quaternion-x', '#quaternion-y', '#quaternion-z', '#quaternion-w'];
    const input_values = ['#quaternion-x-value', '#quaternion-y-value', '#quaternion-z-value', '#quaternion-w-value'];

    // Create a set of [unsorted_input, unsorted_value]
    const input_set = input_names.map((x, i) => [x, input_values[i]]);

    // Set default input behavior
    for (const [input_name, input_value] of input_set) {
        // Set initial value
        $(input_value).val($(input_name).val());

        // Set default on input function for slider and text inputs
        $(input_name).on("input", function () {
            $(input_value).val(this.value);
            setQuaternion();
            console.log(w)
        });
        $(input_value).on("input", function () {
            $(input_name).val(this.value);
            setQuaternion();
        });
    }

    // Set the auto changing behavior for each quaternion axis

}

function setQuaternion(){
    let w = arrowQuaternion.w;
    let x = arrowQuaternion.x;
    let y = arrowQuaternion.y;
    let z = arrowQuaternion.z;

    // get current Euclidean vector
    eVector = new THREE.Vector3(x,y,z);

    arrowQuaternion.set(x,y,z,w);
    arrowLine.applyQuaternion(arrowQuaternion);
    // console.log(arrowLine);
}