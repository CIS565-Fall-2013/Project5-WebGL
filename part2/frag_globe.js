(function () {
    "use strict";
    /*global window,document,Float32Array,Uint16Array,mat4,vec3,snoise*/
    /*global getShaderSource,createWebGLContext,createProgram*/

    function sphericalToCartesian(r, a, z) {
        var x = r * Math.sin(z) * Math.sin(a);
        var y = r * Math.cos(z);
        var z = r * Math.sin(z) * Math.cos(a);

        return [x, y, z];
    }

    var NUM_WIDTH_PTS = 64;
    var NUM_HEIGHT_PTS = 64;

    var message = document.getElementById("message");
    var canvas = document.getElementById("canvas");
    var gl = createWebGLContext(canvas, message);
    if (!gl) {
        return;
    }

    ///////////////////////////////////////////////////////////////////////////

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var persp = mat4.create();
    mat4.perspective(45.0, canvas.width / canvas.height, 0.1, 100.0, persp);

    var radius = 5.0;
    var azimuth = 0.0;
    var zenith = Math.PI / 2.0;

    var eye = sphericalToCartesian(radius, azimuth, zenith);
    var center = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    var view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    // handles for attributes and uniforms in actual shader pair
    var positionLocation = 0;
    var normalLocation = 1;
    var texCoordLocation = 2;
    var u_InvTransLocation;
    var u_ModelLocation;
    var u_ViewLocation;
    var u_ModelViewInverseLocation;
    var u_PerspLocation;
    var u_CameraSpaceDirLightLocation;
    var u_DayDiffuseLocation;
    var u_NightLocation;
    var u_CloudLocation;
    var u_CloudTransLocation;
    var u_EarthSpecLocation;
    var u_BumpLocation;
    var u_timeLocation;

    // positions and uniforms in skybox shader pair
    /*var skyboxPositionLocation = 0;
    var skyboxNormalLocation = 1;
    //var texCoordLocation = 2;
    var u_CameraSpaceLightPosLocation;
    var u_ViewLocation;
    var u_PerspLocation;
    var u_InvTransLocation;*/

    (function initializeShader() {
        // create program for earth shading
        var program;
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

        var program = createProgram(gl, vs, fs, message);

        gl.bindAttribLocation(program, positionLocation, "Position");
        gl.bindAttribLocation(program, normalLocation, "Normal");
        gl.bindAttribLocation(program, texCoordLocation, "Texcoord");

        u_ModelLocation = gl.getUniformLocation(program, "u_Model");
        u_ViewLocation = gl.getUniformLocation(program, "u_View");
        u_ModelViewInverseLocation = gl.getUniformLocation(program, "u_ModelViewInverse");
        u_PerspLocation = gl.getUniformLocation(program, "u_Persp");
        u_InvTransLocation = gl.getUniformLocation(program, "u_InvTrans");
        u_DayDiffuseLocation = gl.getUniformLocation(program, "u_DayDiffuse");
        u_NightLocation = gl.getUniformLocation(program, "u_Night");
        u_CloudLocation = gl.getUniformLocation(program, "u_Cloud");
        u_CloudTransLocation = gl.getUniformLocation(program, "u_CloudTrans");
        u_EarthSpecLocation = gl.getUniformLocation(program, "u_EarthSpec");
        u_BumpLocation = gl.getUniformLocation(program, "u_Bump");
        u_timeLocation = gl.getUniformLocation(program, "u_time");
        u_CameraSpaceDirLightLocation = gl.getUniformLocation(program, "u_CameraSpaceDirLight");

        // create program for skybox shading
        /*var programSkybox;
        var skyboxVS = getShaderSource(document.getElementById("skyboxVS"));
        var skyboxFS = getShaderSource(document.getElementById("skyboxFS"));

        var programSkybox = createProgram(gl, skyboxVS, skyboxFS, message);

        gl.bindAttribLocation(programSkybox, skyboxPositionLocation, "Position");
        gl.bindAttribLocation(programSkybox, skyboxNormalLocation, "Normal");

        u_CameraSpaceLightPosLocation = gl.getUniformLocation(programSkybox, "u_CameraSpaceLightPos");
        u_ViewLocation = gl.getUniformLocation(programSkybox, "u_View");
        u_PerspLocation = gl.getUniformLocation(programSkybox, "u_Persp");
        u_InvTransLocation = gl.getUniformLocation(programSkybox, "u_InvTrans");*/



        gl.useProgram(program);
        //gl.useProgram(programSkybox);
    })();


    /*var skyboxTex = gl.createTexture();

    (function initSkybox() {

        // javaScript arrays can be of mixed types
        var cubeImages = [[gl.TEXTURE_CUBE_MAP_NEGATIVE_X, "left.png"],
                          [gl.TEXTURE_CUBE_MAP_POSITYVE_X, "right.png"],
                          [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, "bottom.png"],
                          [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, "top.png"],
                          [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, "back.png"],
                          [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, "front.png"]]

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        for (var i = 0; i < 6; ++i) {
            var image = new Image();
            image.onload = function (image) {
                gl.texImage2D(cubeImages[i][0], 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            }
            image.src = cubeImages[i][1];

        }
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    })();*/

    var dayTex = gl.createTexture();
    var bumpTex = gl.createTexture();
    var cloudTex = gl.createTexture();
    var transTex = gl.createTexture();
    var lightTex = gl.createTexture();
    var specTex = gl.createTexture();

    (function initTextures() {
        function initLoadedTexture(texture) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                               gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                                  gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                                  gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
                                  gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
                                  gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        function initializeTexture(texture, src) {
            texture.image = new Image();
            texture.image.onload = function () {
                initLoadedTexture(texture);
            }
            texture.image.src = src;
        }

        initializeTexture(dayTex, "earthmap1k.png");
        initializeTexture(bumpTex, "earthbump1k.png");
        initializeTexture(lightTex, "earthlight1k.png");
        initializeTexture(specTex, "earthspec1k.png");
        initializeTexture(cloudTex, "earthcloud1k.png");
        initializeTexture(transTex, "earthtrans1k.png");

    })();


    /*var numberOfSkyboxIndices;
    (function intializeSkybox() {
        var positions = [
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
        ];
        var indices = new Uint16Array(6 * 2 * 3);
        for (var i = 0; i < indices.length; ++i) {
            indices[i] = i;
        }
        var normals = [
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,

            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0
        ];

        // Positions
        var positionsName = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(skyboxPositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skyboxPositionLocation);

        // Normals
        var normalsName = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(skyboxNormalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(skyboxNormalLocation);

        // Indices
        var indicesName = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        numberOfSkyboxIndices = 6 * 2 * 3;

    })();*/


    var numberOfIndices;
    (function initializeSphere() {
        function uploadMesh(positions, texCoords, indices) {
            // Positions
            var positionsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);

            // Normals
            var normalsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLocation);

            // TextureCoords
            var texCoordsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(texCoordLocation);

            // Indices
            var indicesName = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);
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
        var length;

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
    })();

    // mouse control call backs
    var time = 0;
    var mouseLeftDown = false;
    var mouseRightDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

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

    canvas.onmousedown = handleMouseDown;
    canvas.oncontextmenu = function (ev) { return false; };
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;


    (function animate() {
        ///////////////////////////////////////////////////////////////////////////
        // Update

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
        /*var lightPos = vec3.create([1.0, 0.0, 1.0]);
        var lightdest = vec4.create();
        mat4.multiplyVec4(view, [lightPos[0], lightPos[1], lightPos[2], 1.0], lightdest);*/




        ///////////////////////////////////////////////////////////////////////////
        // Render
        //gl.depthMask(false);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        /*gl.uniformMatrix4fv(u_ViewLocation, false, view);
        //gl.uniformMatrix4fv(u_ModelViewInverseLocation, false, modelViewMatrixInverse);
        gl.uniformMatrix4fv(u_PerspLocation, false, persp);
        gl.uniformMatrix4fv(u_InvTransLocation, false, invTrans);
        gl.uniform3fv(u_CameraSpaceLightPosLocation, lightdest);

        gl.drawElements(gl.TRIANGLES, numberOfSkyboxIndices, gl.UNSIGNED_SHORT, 0);*/
        
        gl.uniformMatrix4fv(u_ModelLocation, false, model);
        gl.uniformMatrix4fv(u_ViewLocation, false, view);
        gl.uniformMatrix4fv(u_ModelViewInverseLocation, false, modelViewMatrixInverse);
        gl.uniformMatrix4fv(u_PerspLocation, false, persp);
        gl.uniformMatrix4fv(u_InvTransLocation, false, invTrans);

        gl.uniform3fv(u_CameraSpaceDirLightLocation, lightdir);
        gl.uniform1f(u_timeLocation, time);

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
        gl.uniform1i(u_EarthSpecLocation, 5)

        gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_SHORT, 0);;

        time += 0.001;
        window.requestAnimFrame(animate);
    })();

} ());
