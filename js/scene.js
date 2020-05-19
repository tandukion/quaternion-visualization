
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
    eulerAxisLine = new THREE.Line();
    eulerAxisLine.name = "EulerAxis";
    drawEulerAxis();
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

function drawEulerAxis(){

    const material = new THREE.LineBasicMaterial({color: 0xFFFF00, transparent: true, opacity: 0.8, linewidth: lineWidth});
    let geometry = new THREE.Geometry();
    let axisClone = eulerAxis.clone()
    geometry.vertices.push(
        new THREE.Vector3( 0, 0, 0 ),
        axisClone.multiplyScalar(lineWidth),
    );
    eulerAxisLine.geometry = geometry;
    eulerAxisLine.material = material;
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
        .val(parseFloat(arrowQuaternion.w).toFixed(3))
        .on("input", function () {
        $('#quaternion-w-value').val(this.value);
        setQuaternion(this.name,this.value);
    });
    $('#quaternion-w-value')
        .val(parseFloat(arrowQuaternion.w).toFixed(3))
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
        $(slider).val(parseFloat(initialValues[index]).toFixed(3))
        $(value).val(parseFloat(initialValues[index]).toFixed(3))

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
            angle = Math.acos(w);

            eulerAxisLength = Math.abs(Math.sin(angle));

            // Set the other axis values
            x = eulerAxis.x * eulerAxisLength;
            y = eulerAxis.y * eulerAxisLength;
            z = eulerAxis.z * eulerAxisLength;
            axisValues = [x, y, z, parseFloat(w)];

            // Update settings input
            applySettings(axisValues);
            break;
        case "x":
            w = parseFloat(arrowQuaternion.w);

            // Unit vector
            ux = value / eulerAxisLength;
            uy = eulerAxis.y;
            uz = eulerAxis.z;

            // Calculate on unit vector
            let dx = ux - eulerAxis.x;
            let d = deltaSolver(dx,ux,uy,uz);
            uy += d;
            uz += d;

            // Apply the Euler axis
            eulerAxis.set(ux,uy,uz);
            drawEulerAxis();

            // Update settings input
            x = parseFloat(value);
            y = uy * eulerAxisLength;
            z = uz * eulerAxisLength;
            axisValues = [x, y, z, w];
            applySettings(axisValues);

            break;
        case "y":
            w = parseFloat(arrowQuaternion.w);

            // Unit vector
            ux = eulerAxis.x;
            uy = value / eulerAxisLength;
            uz = eulerAxis.z;

            // Case #1 Change only z axis
            if (Math.abs(uy) < Math.sqrt(1 - Math.pow(ux/eulerAxisLength,2)) ){
                // Calculate on unit vector
                // Calculate on unit vector
                let uzTemp = Math.sqrt(1 - Math.pow(ux/eulerAxisLength,2)- Math.pow(uy,2));
                if (uz>=0){
                    uz = uzTemp;
                }
                else{
                    uz = -1 * uzTemp;
                }

                // Apply the Euler axis
                eulerAxis.set(ux,uy,uz);
                drawEulerAxis();

                // Update settings input
                x = ux * eulerAxisLength;
                y = parseFloat(value);
                z = uz * eulerAxisLength;
                axisValues = [x, y, z, w];
                applySettings(axisValues);
            }
            else{
                // Calculate on unit vector
                let dy = uy - eulerAxis.y;
                let d = deltaSolver(dy,uy,ux,uz);
                ux += d;
                uz += d;

                // Apply the Euler axis
                eulerAxis.set(ux,uy,uz);
                drawEulerAxis();

                // Update settings input
                x = ux * eulerAxisLength;
                y = parseFloat(value);
                z = uz * eulerAxisLength;
                axisValues = [x, y, z, w];
                applySettings(axisValues);
            }
            break;
        case "z":
            w = parseFloat(arrowQuaternion.w);

            // Unit vector
            ux = eulerAxis.x;
            uy = eulerAxis.y;
            uz = value / eulerAxisLength

            // Case #1 Change only y axis
            if (Math.abs(uz) < Math.sqrt(1 - Math.pow(ux,2)) ){
                // Calculate on unit vector
                let uyTemp = Math.sqrt(1 - Math.pow(ux,2)- Math.pow(uz,2));
                if (uy>0){
                    uy = uyTemp;
                }
                else{
                    uy = -1 * uyTemp;
                }

                // Apply the Euler axis
                eulerAxis.set(ux,uy,uz);
                drawEulerAxis();

                // Update settings input
                x = ux * eulerAxisLength;
                y = uy * eulerAxisLength;
                z = parseFloat(value);
                axisValues = [x, y, z, w];
                applySettings(axisValues);
            }
            else{
                // Calculate on unit vector
                let dz = uz - eulerAxis.z;
                let d = deltaSolver(dz,uz,uy,ux);
                ux += d;
                uy += d;

                // Apply the Euler axis
                eulerAxis.set(ux,uy,uz);
                drawEulerAxis();

                // Update settings input
                x = ux * eulerAxisLength;
                y = uy * eulerAxisLength;
                z = parseFloat(value);
                axisValues = [x, y, z, w];
                applySettings(axisValues);
            }
            break;
        default:
            break;
    }
}

/**
 *
 * @param axis{list}: List of quaternion axis values
 */
function applySettings(axis){
    const inputSlider = ['#quaternion-x', '#quaternion-y', '#quaternion-z', '#quaternion-w'];
    const inputValues = ['#quaternion-x-value', '#quaternion-y-value', '#quaternion-z-value', '#quaternion-w-value'];

    // Create a set of [unsorted_input, unsorted_value]
    const inputSet = inputSlider.map((x, i) => [x, inputValues[i]]);
    inputSet.forEach(function([slider, value], index){
        $(slider).val(parseFloat(axis[index]).toFixed(3));
        $(value).val(parseFloat(axis[index]).toFixed(3));
    });


    // Apply the quaternion
    arrowQuaternion.set(axis[0],axis[1],axis[2],axis[3]);
    arrowLine.setRotationFromQuaternion (arrowQuaternion);

    // console.log(axisValues);
}

/**
 *
 * For a Euler axis, if known x value to be set, we want to get the change for y and z axis.
 * Assumed the changes are same for y and z axis
 * With:
 *      x    : inital x value
 *      dx   : delta x
 *      y,z  : initial y, z value
 *      d    : delta change
 * Since Euler axis is unit vector:
 *      (x+dx)2 + (y+d)2 + (z+d)2 = 1
 *      (x+dx)2 + y2 + z2 + 2(+y+z)d + 2d2 = 1
 *      d2 + 2(y+z)d + (-1 + (x+dx)2 + y2 + z2) = 0
 *      d = (-b + sqrt(b2 - 4ac)) / 2a
 *      With:   a = 1
 *              b = y+z
 *              c = (-1 + (x+dx)2 + y2 + z2)
 * @param dx{number}: delta on X
 * @param x{number}: given target x value (x+d)
 * @param y{number}: initial y value
 * @param z{number}: initial z value
 */
function deltaSolver(dx,x,y,z){
    if (dx === 0) {
        return 0;
    }
    else{
        let a = 1;
        let b = y + z;
        let c = (-1 + Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)) / 2;
        if ((Math.pow(b, 2) - 4 * a * c) < 0){
            return 0;
        }
        if (b > 0){
            return (-1 * b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
        }
        else{
            return (-1 * b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
        }
    }
}