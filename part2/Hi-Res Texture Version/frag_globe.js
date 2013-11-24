var message;
var canvas;
var gl;

// shader programs
var programGlobe;
var programSkybox;
  
// handles for attributes and uniforms in globe shader pair
var positionLocation;
var normalLocation;
var texCoordLocation;

var u_InvTransLocation;
var u_ModelLocation;
var u_ViewLocation;
var u_ModelViewInverseLocation;
var u_PerspLocation;
var u_timeLocation;
var u_CameraSpaceDirLightLocation;

var u_DayDiffuseLocation;
var u_NightLocation;
var u_CloudLocation;
var u_CloudTransLocation;
var u_EarthSpecLocation;
var u_BumpLocation;
   

// positions and uniforms in skybox shader pair
var skyboxPositionLocation;
var skyboxNormalLocation;  

var u_CameraSpaceLightPosLocation;
var u_skyboxViewLocation;
var u_skyboxPerspLocation;
var u_skyboxInvTransLocation;

var u_cubeTextureLocation;

function initializeShader() {
    // create programGlobe for earth shading
    var vs = getShaderSource(document.getElementById("vs"));
    var fs = getShaderSource(document.getElementById("fs"));

    programGlobe = createProgram(gl, vs, fs, message);
    
    // attributes
    positionLocation = gl.getAttribLocation(programGlobe, "Position");
    normalLocation = gl.getAttribLocation(programGlobe, "Normal");
    texCoordLocation = gl.getAttribLocation(programGlobe, "Texcoord");
    // uniforms
    u_ModelLocation = gl.getUniformLocation(programGlobe, "u_Model");
    u_ViewLocation = gl.getUniformLocation(programGlobe, "u_View");
    u_ModelViewInverseLocation = gl.getUniformLocation(programGlobe, "u_ModelViewInverse");
    u_PerspLocation = gl.getUniformLocation(programGlobe, "u_Persp");
    u_InvTransLocation = gl.getUniformLocation(programGlobe, "u_InvTrans");
    u_timeLocation = gl.getUniformLocation(programGlobe, "u_time");
    u_CameraSpaceDirLightLocation = gl.getUniformLocation(programGlobe, "u_CameraSpaceDirLight");
    // textures
    u_DayDiffuseLocation = gl.getUniformLocation(programGlobe, "u_DayDiffuse");
    u_NightLocation = gl.getUniformLocation(programGlobe, "u_Night");
    u_CloudLocation = gl.getUniformLocation(programGlobe, "u_Cloud");
    u_CloudTransLocation = gl.getUniformLocation(programGlobe, "u_CloudTrans");
    u_EarthSpecLocation = gl.getUniformLocation(programGlobe, "u_EarthSpec");
    u_BumpLocation = gl.getUniformLocation(programGlobe, "u_Bump");
    

    // create programGlobe for skybox shading
    var skyboxVS = getShaderSource(document.getElementById("skyboxVS"));
    var skyboxFS = getShaderSource(document.getElementById("skyboxFS"));

    programSkybox = createProgram(gl, skyboxVS, skyboxFS, message);
    skyboxPositionLocation = gl.getAttribLocation(programSkybox, "Position");
    
    u_CameraSpaceLightPosLocation = gl.getUniformLocation(programSkybox, "u_CameraSpaceLightPos");
    u_skyboxViewLocation = gl.getUniformLocation(programSkybox, "u_View");
    u_skyboxPerspLocation = gl.getUniformLocation(programSkybox, "u_Persp");
    //u_skyboxInvTransLocation = gl.getUniformLocation(programSkybox, "u_InvTrans");
    
    u_cubeTextureLocation = gl.getUniformLocation(programSkybox, "u_cubeTexture");

}







var skyboxTex;

function initSkyboxTex() {
	
	skyboxTex = gl.createTexture();	
	gl.activeTexture(gl.TEXTURE0);
    // javaScript arrays can be of mixed types
    var cubeImages = [[gl.TEXTURE_CUBE_MAP_POSITIVE_X, "4096_right1.png"],
                      [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, "4096_left2.png"],
                      [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, "4096_top3.png"],
                      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, "4096_bottom4.png"],
                      [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, "4096_front5.png"],
                      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, "4096_back6.png"]];

    // While a texture is bound, GL operations on the target to which it is
    // bound affect the bound texture, and queries of the target to which it
    // is bound return state from the bound texture.
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    function initLoadedCubeMap(texture, face, image) {
    	//alert(image.complete);
    	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    	gl.texImage2D(face, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    	//message.innerHTML += image.complete + "\n";
    	
    	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
    
    for (var i = 0; i < cubeImages.length; i++) {
        var face = cubeImages[i][0];
        var image = new Image();
        image.onload = function(texture, face, image) {
            return function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            };
        } (skyboxTex, face, image);
        // image load functions that do not work
        /*image.onload = function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        };*/
        /* image.onload = function() {
        	return initLoadedCubeMap(skyboxTex, face, image)
        };*/
        image.src = cubeImages[i][1];
    }

}



var dayTex;
var bumpTex;
var cloudTex;
var transTex;
var lightTex;
var specTex;

function initGlobeTex(){
	dayTex = gl.createTexture();
    bumpTex = gl.createTexture();
    cloudTex = gl.createTexture();
    transTex = gl.createTexture();
    lightTex = gl.createTexture();
    specTex = gl.createTexture();

    
    function initLoadedTexture(texture) {
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	    gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function initializeTexture(texture, src) {
	    texture.image = new Image();
	    texture.image.onload = function () {
	    	initLoadedTexture(texture);
	    };
	    texture.image.src = src;
    }

    initializeTexture(dayTex, "earthmap4k.jpg");
    initializeTexture(bumpTex, "earthbump4k.jpg");
    initializeTexture(lightTex, "earthlights4k.jpg");
    initializeTexture(specTex, "earthspec4k.jpg");
    initializeTexture(cloudTex, "earthcloud1k.png");
    initializeTexture(transTex, "earthtrans1k.png");
}

var positionsName;
var indicesName;
var numberOfSkyboxIndices;

function intializeSkybox() {
	var positions = new Float32Array([
	      // neg z, back                            	
          -10.0, 10.0, -10.0, -10.0, -10.0, -10.0, 10.0, -10.0, -10.0,
          10.0, -10.0, -10.0, 10.0, 10.0, -10.0, -10.0, 10.0, -10.0,
          // neg x, left
          -10.0, -10.0, 10.0, -10.0, -10.0, -10.0, -10.0, 10.0, -10.0,
          -10.0, 10.0, -10.0, -10.0, 10.0, 10.0, -10.0, -10.0, 10.0,
          // pos x, right
          10.0, -10.0, -10.0, 10.0, -10.0, 10.0, 10.0, 10.0, 10.0,
          10.0, 10.0, 10.0, 10.0, 10.0, -10.0, 10.0, -10.0, -10.0,
          // pos z, front
          -10.0, -10.0, 10.0, -10.0, 10.0, 10.0, 10.0, 10.0, 10.0,
          10.0, 10.0, 10.0, 10.0, -10.0, 10.0, -10.0, -10.0, 10.0,
          // pos y, top
          -10.0, 10.0, -10.0, 10.0, 10.0, -10.0, 10.0, 10.0, 10.0,
          10.0, 10.0, 10.0, -10.0, 10.0, 10.0, -10.0, 10.0, -10.0,
          // neg y, bottom
          -10.0, -10.0, -10.0, -10.0, -10.0, 10.0, 10.0, -10.0, -10.0,
          10.0, -10.0, -10.0, -10.0, -10.0, 10.0, 10.0, -10.0, 10.0
          ]);

    var indices = new Uint16Array(6 * 2 * 3);
    for (var i = 0; i < indices.length; ++i) {
        indices[i] = i;
    }
    
    // Positions
    positionsName = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
   
    // Indices
    indicesName = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    numberOfSkyboxIndices = indices.length;

}


var NUM_WIDTH_PTS = 64;
var NUM_HEIGHT_PTS = 64;

var globePosBuffer;
var globeNormBuffer;
var globeTexCoorBuffer;
var globeIndices;
var numberOfIndices;

function initializeSphere() {
    function uploadMesh(positions, texCoords, indices) {
	    // Positions
	    globePosBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, globePosBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	    
	    // Normals
	    globeNormBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, globeNormBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	    
	    // TextureCoords
	    globeTexCoorBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, globeTexCoorBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
	
	    // Indices
	    globeIndices = gl.createBuffer();
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, globeIndices);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    var WIDTH_DIVISIONS = NUM_WIDTH_PTS - 1;
    var HEIGHT_DIVISIONS = NUM_HEIGHT_PTS - 1;

    var numberOfPositions = NUM_WIDTH_PTS * NUM_HEIGHT_PTS;

    var positions = new Float32Array(3 * numberOfPositions);
    var texCoords = new Float32Array(2 * numberOfPositions);
    var indices = new Uint16Array(6 * (WIDTH_DIVISIONS * HEIGHT_DIVISIONS));

    var positionsIndex = 0;
    var texCoordsIndex = 0;
    var indicesIndex = 0;

    for (var j = 0; j < NUM_HEIGHT_PTS; ++j) {
	    var inclination = Math.PI * (j / HEIGHT_DIVISIONS);
	    for (var i = 0; i < NUM_WIDTH_PTS; ++i) {
		    var azimuth = 2 * Math.PI * (i / WIDTH_DIVISIONS);
		    positions[positionsIndex++] = Math.sin(inclination) * Math.sin(azimuth);
		    positions[positionsIndex++] = Math.cos(inclination);
		    positions[positionsIndex++] = Math.sin(inclination) * Math.cos(azimuth);
		    texCoords[texCoordsIndex++] = i / WIDTH_DIVISIONS;
		    texCoords[texCoordsIndex++] = 1.0 - j / HEIGHT_DIVISIONS;
	    }
    }
    
    for (var j = 0; j < HEIGHT_DIVISIONS; ++j)  // a bunch of degenerate triangles at poles
    {
	    var index = j * NUM_WIDTH_PTS;
	    for (var i = 0; i < WIDTH_DIVISIONS; ++i) {
	    	indices[indicesIndex++] = index + i;
    		indices[indicesIndex++] = index + i + 1;
	    	indices[indicesIndex++] = index + i + NUM_WIDTH_PTS;
	    	indices[indicesIndex++] = index + i + NUM_WIDTH_PTS;
	    	indices[indicesIndex++] = index + i + 1;
	    	indices[indicesIndex++] = index + i + NUM_WIDTH_PTS + 1;
	    }
    }
    

    uploadMesh(positions, texCoords, indices);
    numberOfIndices = indicesIndex;
};


//time for animating globe
var time = 0;

//Camera control
var mouseLeftDown = false;
var mouseRightDown = false;
var lastMouseX = null;
var lastMouseY = null;

var radius = 5.0;
var azimuth = 0.0;
var zenith = Math.PI / 2.0;

var center = [0.0, 0.0, 0.0];
var up = [0.0, 1.0, 0.0];

var persp;
var eye;
var view;

// mouse control callbacks
function handleMouseDown(event) {
    if (event.button == 2) {
        mouseLeftDown = false;
        mouseRightDown = true;
    }
    else {
        mouseLeftDown = true;
        mouseRightDown = false;
    }
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseLeftDown = false;
    mouseRightDown = false;
}

function handleMouseMove(event) {
    if (!(mouseLeftDown || mouseRightDown)) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;

    if (mouseLeftDown) {
        azimuth -= 0.01 * deltaX;
        zenith -= 0.01 * deltaY;
        zenith = Math.min(Math.max(zenith, 0.001), Math.PI - 0.001);
    }
    else {
        radius += 0.01 * deltaY;
        radius = Math.min(Math.max(radius, 2.0), 10.0);
    }
    eye = sphericalToCartesian(radius, azimuth, zenith);
    view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    lastMouseX = newX;
    lastMouseY = newY;
}

function sphericalToCartesian(r, azimuth, zenith) {
    var x = r * Math.sin(zenith) * Math.sin(azimuth);
    var y = r * Math.cos(zenith);
    var z = r * Math.sin(zenith) * Math.cos(azimuth);

    return [x, y, z];
}

/////////////////////////////////////////////////////////////////////////////////
function globeMain() {
	
    "use strict";
    message = document.getElementById("message");
    canvas = document.getElementById("canvas");
    gl = createWebGLContext(canvas, message);
    if (!gl) {
        return;
    }
    
    canvas.onmousedown = handleMouseDown;
    canvas.oncontextmenu = function (ev) { return false; };
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    persp = mat4.create();
    mat4.perspective(45.0, canvas.width / canvas.height, 0.1, 100.0, persp);
    
    eye = sphericalToCartesian(radius, azimuth, zenith);   
    view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    initializeShader();

    initSkyboxTex();
    
    intializeSkybox();
   
    initGlobeTex();
   
    initializeSphere();
 

    (function animate() {// Update
        
    	(function drawGlobe() {
    		
    		gl.useProgram(programGlobe);
    	
    		// disable attributes for other programs
	    	gl.disableVertexAttribArray(skyboxPositionLocation);	
	    	 
	    	// enable attributes for this program
		    gl.bindBuffer(gl.ARRAY_BUFFER, globePosBuffer);
		    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(positionLocation);

		    gl.bindBuffer(gl.ARRAY_BUFFER, globeNormBuffer);
		    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(normalLocation);

		    gl.bindBuffer(gl.ARRAY_BUFFER, globeTexCoorBuffer);
		    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(texCoordLocation);
	    	
		    // calculate and pass uniforms
	        var model = mat4.create();
	        mat4.identity(model);
	        mat4.rotate(model, 23.4 / 180 * Math.PI, [0.0, 0.0, 1.0]);
	        mat4.rotate(model, time, [0.0, 1.0, 0.0]);
	        var mv = mat4.create();
	        mat4.multiply(view, model, mv);
	
	        var modelViewMatrixInverse = mat4.create();
	        mat4.inverse(mv, modelViewMatrixInverse);
	
	        var invTrans = mat4.create();
	        mat4.inverse(mv, invTrans);
	        mat4.transpose(invTrans);
	
	        var lightdir = vec3.create([1.0, 0.0, 1.0]);
	        var lightdest = vec4.create();
	        vec3.normalize(lightdir);
	        mat4.multiplyVec4(view, [lightdir[0], lightdir[1], lightdir[2], 0.0], lightdest);
	        lightdir = vec3.createFrom(lightdest[0], lightdest[1], lightdest[2]);
	        vec3.normalize(lightdir);
	        
	        gl.uniformMatrix4fv(u_ModelLocation, false, model);
	        gl.uniformMatrix4fv(u_ViewLocation, false, view);
	        gl.uniformMatrix4fv(u_ModelViewInverseLocation, false, modelViewMatrixInverse);
	        gl.uniformMatrix4fv(u_PerspLocation, false, persp);
	        gl.uniformMatrix4fv(u_InvTransLocation, false, invTrans);
	
	        gl.uniform3fv(u_CameraSpaceDirLightLocation, lightdir);
	        gl.uniform1f(u_timeLocation, time);
	
	        // pass textures
	        gl.activeTexture(gl.TEXTURE0);
	        gl.bindTexture(gl.TEXTURE_2D, dayTex);
	        gl.uniform1i(u_DayDiffuseLocation, 0);
	
	        gl.activeTexture(gl.TEXTURE1);
	        gl.bindTexture(gl.TEXTURE_2D, bumpTex);
	        gl.uniform1i(u_BumpLocation, 1);
	
	        gl.activeTexture(gl.TEXTURE2);
	        gl.bindTexture(gl.TEXTURE_2D, cloudTex);
	        gl.uniform1i(u_CloudLocation, 2);
	
	        gl.activeTexture(gl.TEXTURE3);
	        gl.bindTexture(gl.TEXTURE_2D, transTex);
	        gl.uniform1i(u_CloudTransLocation, 3);
	
	        gl.activeTexture(gl.TEXTURE4);
	        gl.bindTexture(gl.TEXTURE_2D, lightTex);
	        gl.uniform1i(u_NightLocation, 4);
	
	        gl.activeTexture(gl.TEXTURE5);
	        gl.bindTexture(gl.TEXTURE_2D, specTex);
	        gl.uniform1i(u_EarthSpecLocation, 5);
	
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, globeIndices);
	        gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_SHORT, 0);
    	})();
        
    	(function drawSkybox(){
    		gl.useProgram(programSkybox);
            
    		// disable attributes for other programs
            gl.disableVertexAttribArray(positionLocation);
            gl.disableVertexAttribArray(normalLocation);
            gl.disableVertexAttribArray(texCoordLocation);
            
            // enable attributes for this program
            gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
            gl.vertexAttribPointer(skyboxPositionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(skyboxPositionLocation);
       
            // calculate and pass uniforms
            gl.uniformMatrix4fv(u_skyboxViewLocation, false, view);
            gl.uniformMatrix4fv(u_skyboxPerspLocation, false, persp);

            // pass textures
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
            gl.uniform1i(u_cubeTextureLocation, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);
            gl.drawElements(gl.TRIANGLES, numberOfSkyboxIndices, gl.UNSIGNED_SHORT, 0);
    	})();
            
        time += 0.001;
        
        window.requestAnimFrame(animate);
    })();

}
