
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

// Axis angle for the rotiation. Need to be a unit vector (normalized)
let eulerAxisLine;
let eulerAxis = new THREE.Vector3(1, 0, 0).normalize();
let eulerAxisLength;

// Arrow visual for the orientation
let arrowLine;
let arrowQuaternion = new THREE.Quaternion();
arrowQuaternion.set(0.0, 0.0, 0.0, 1);

// Run all the setup function on document ready
$(document).ready(function() {
    setupViewer();
    drawViewer();

    setupSettings();
});

/**
 * Setup the viewer scene and all of its member
 */
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
    camera.name = "Camera";
    scene.add(camera);

    // Add camera control
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add grid
    const size = 10;
    const divisions = 10;

    grid = new THREE.GridHelper( size, divisions );
    grid.name = "Grid";
    scene.add(grid);

    // Add main axis
    axesHelper = new THREE.AxesHelper(lineLength);
    axesHelper.name = "MainAxes";
    axesHelper.material.linewidth = lineWidth;
    scene.add( axesHelper );

    // Show the axis angle
    const axisMaterial = new THREE.LineBasicMaterial({color: 0xFFFF00, transparent: true, opacity: 0.8, linewidth: lineWidth});
    let geometry = new THREE.Geometry();
    let axisClone = eulerAxis.clone()
    geometry.vertices.push(
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( lineLength, 0, 0 ),
        // axisClone.multiplyScalar(lineWidth),
    );
    eulerAxisLine = new THREE.Group();
    eulerAxisLine.add(new THREE.Line(geometry, axisMaterial));
    eulerAxisLine.name = "EulerAxis";
    eulerAxisLine.setRotationFromAxisAngle(eulerAxis,0);
    scene.add(eulerAxisLine);

    // Create the arrow for the given orientation
    arrowLine = new THREE.Group();
    arrowLine.name = "Arrow";
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

/**
 * Function that handles the interactive camera orbit controls
 */
function drawViewer(){

    // update the controls
    cameraControls.update();

    // set the scene
    // renderer.clear(true, true, true);
    renderer.render(scene, camera);

    // draw the frame
    requestAnimationFrame(drawViewer);
}

/**
 * Setup the settings inputs for the object
 */
function setupSettings() {
    let initialValues = []
    arrowQuaternion.toArray(initialValues);

    // Handle w axis input
    // Set initial value
    $('#quaternion-w')
        .val(arrowQuaternion.w.toFixed(3))
        .on("input", function () {
        $('#quaternion-w-value').val(this.value);
        setQuaternion(this.name,this.value);
    });
    $('#quaternion-w-value')
        .val(arrowQuaternion.w.toFixed(3))
        .on("input", function () {
        $('#quaternion-w').val(this.value);
        setQuaternion(this.name,this.value);
    });

    // Handle x, y, z inputs
    // Set the value based on range inputs
    const inputSlider = ['#quaternion-x', '#quaternion-y', '#quaternion-z'];
    const inputValues = ['#quaternion-x-value', '#quaternion-y-value', '#quaternion-z-value'];

    // Create a set of input
    const inputSet = inputSlider.map((x, i) => [x, inputValues[i]]);

    // Set default input behavior
    inputSet.forEach(function([slider, value], index){
        // Set initial value
        $(slider).val(initialValues[index].toFixed(3))
        $(value).val(initialValues[index].toFixed(3))

        // Set default on input function for slider and text inputs
        $(slider).on("input", function () {
            if (this.value > eulerAxisLength){
                this.value = eulerAxisLength;
            }
            else if (this.value < -1 * eulerAxisLength){
                this.value = -1 * eulerAxisLength;
            }
            $(value).val(this.value);
            setQuaternion(this.name,this.value);
        });
        $(value).on("input", function () {
            if (this.value > eulerAxisLength){
                this.value = eulerAxisLength;
            }
            else if (this.value < -1 * eulerAxisLength){
                this.value = -1 * eulerAxisLength;
            }
            $(slider).val(this.value);
            setQuaternion(this.name,this.value);
        });
    });

}

/**
 * Set Quaternion from inputs
 * @param axis{string}: Name of the axis
 * @param value{number}: Value of the axis
 */
function setQuaternion(axis, value){
    // Axis value
    let x,y,z,w;
    let axisValues;
    // Unit vector for Euler axis
    let ux, uy, uz;

    let angle;

    switch(axis){
        case "w":
            w = value;
            // Get the Euler axis angle
            angle = Math.acos(w) * 2;

            eulerAxisLength = Math.sin(angle/2);

            // Set the other axis values
            x = eulerAxis.x * eulerAxisLength;
            y = eulerAxis.y * eulerAxisLength;
            z = eulerAxis.z * eulerAxisLength;
            axisValues = [x, y, z, parseFloat(w)];

            // Update settings input
            applySettings(axisValues);
            break;
        case "x":
            // Handle limit value
            if (value > eulerAxisLength){
                value = eulerAxisLength;
            }
            else if (value < -1 * eulerAxisLength){
                value = -1 * eulerAxisLength;
            }

            w = parseFloat(arrowQuaternion.w);
            angle = Math.acos(w);

            // Calculate on unit vector
            ux = value / Math.sin(angle);
            uy = Math.sqrt((1 - Math.pow(ux,2))/2);
            uz = Math.sqrt((1 - Math.pow(ux,2))/2);

            // Apply the Euler axis
            eulerAxis.set(ux,uy,uz);

            x = parseFloat(value);
            y = uy * Math.sin(angle);
            z = uz * Math.sin(angle);

            // We need the unit vector
            axisValues = [x, y, z, w];
            // eulerAxisLine.setRotationFromAxisAngle(eulerAxis,0);

            // Update settings input
            applySettings(axisValues);
            break;
        default:
            break;
    }
}

function applySettings(axis){
    const inputSlider = ['#quaternion-x', '#quaternion-y', '#quaternion-z', '#quaternion-w'];
    const inputValues = ['#quaternion-x-value', '#quaternion-y-value', '#quaternion-z-value', '#quaternion-w-value'];

    // Create a set of [unsorted_input, unsorted_value]
    const inputSet = inputSlider.map((x, i) => [x, inputValues[i]]);
    inputSet.forEach(function([slider, value], index){
        $(slider).val(axis[index].toFixed(3));
        $(value).val(axis[index].toFixed(3));
    });


    // Apply the quaternion
    arrowQuaternion.set(axis[0],axis[1],axis[2],axis[3]);
    arrowLine.setRotationFromQuaternion (arrowQuaternion);

    // console.log(axisValues);
}