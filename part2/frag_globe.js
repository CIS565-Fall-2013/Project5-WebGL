(function() {
    "use strict";
    /*global window,document,Float32Array,Uint16Array,mat4,vec3,snoise*/
    /*global getShaderSource,createWebGLContext,createProgram*/

    function sphericalToCartesian( r, a, e ) {
        var x = r * Math.cos(e) * Math.cos(a);
        var y = r * Math.sin(e);
        var z = r * Math.cos(e) * Math.sin(a);

        return [x,y,z];
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
    mat4.perspective(45.0, canvas.width/canvas.height, 0.1, 100.0, persp);

    var radius = 5.0;
    var azimuth = Math.PI;
    var elevation = 0.0001;

    var eye = sphericalToCartesian(radius, azimuth, elevation);
    var center = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    var view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    var positionLocation;
    var normalLocation;
    var texCoordLocation;
    var u_InvTransLocation;
    var u_ModelLocation;
    var u_ViewLocation;
    var u_PerspLocation;
    var u_CameraSpaceDirLightLocation;
    var u_DayDiffuseLocation;
    var u_NightLocation;
    var u_CloudLocation;
    var u_CloudTransLocation;
    var u_EarthSpecLocation;
    var u_BumpLocation;
    var u_timeLocation;
    var u_resInverseLocation;

    var u_cubeModelViewLocation;
    var u_cubePerspLocation;
    var cubeVPositionLocation;
    var cubeVTexCoordLocation;
    var u_CubeTransformMatrixLocation;
    var u_CubeTextureLocation;

    var program ;
    var cubeMapProgram;

    (function initializeShader() {
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));
        var vs_cubemap = getShaderSource(document.getElementById("vs_cubemap"));
        var fs_cubemap = getShaderSource(document.getElementById("fs_cubemap"));

        cubeMapProgram = createProgram(gl, vs_cubemap, fs_cubemap, message);
        gl.useProgram(cubeMapProgram);
        cubeVPositionLocation = gl.getAttribLocation(cubeMapProgram, "CubeVPosition");
        //cubeVTexCoordLocation = gl.getAttribLocation(cubeMapProgram, "CubeVTexCoord");
        u_CubeTransformMatrixLocation = gl.getUniformLocation(cubeMapProgram,"u_CubeTransMat");
        u_cubeModelViewLocation = gl.getUniformLocation(cubeMapProgram,"u_ModelView");
        u_cubePerspLocation = gl.getUniformLocation(cubeMapProgram,"u_Persp");
        u_CubeTextureLocation= gl.getUniformLocation(cubeMapProgram,"u_CubeTexture");

        program = createProgram(gl, vs, fs, message);
        gl.useProgram(program);
        positionLocation = gl.getAttribLocation(program, "Position");
        normalLocation = gl.getAttribLocation(program, "Normal");
        texCoordLocation = gl.getAttribLocation(program, "Texcoord");
        u_ModelLocation = gl.getUniformLocation(program,"u_Model");
        u_ViewLocation = gl.getUniformLocation(program,"u_View");
        u_PerspLocation = gl.getUniformLocation(program,"u_Persp");
        u_InvTransLocation = gl.getUniformLocation(program,"u_InvTrans");
        u_DayDiffuseLocation = gl.getUniformLocation(program,"u_DayDiffuse");
        u_NightLocation = gl.getUniformLocation(program,"u_Night");
        u_CloudLocation = gl.getUniformLocation(program,"u_Cloud");
        u_CloudTransLocation = gl.getUniformLocation(program,"u_CloudTrans");
        u_EarthSpecLocation = gl.getUniformLocation(program,"u_EarthSpec");
        u_BumpLocation = gl.getUniformLocation(program,"u_Bump");
        u_timeLocation = gl.getUniformLocation(program,"u_time");
        u_CameraSpaceDirLightLocation = gl.getUniformLocation(program,"u_CameraSpaceDirLight");
        u_resInverseLocation = gl.getUniformLocation(program,"u_resInverse");
            
    })();

    var dayTex = gl.createTexture();
    var bumpTex = gl.createTexture();
    var cloudTex = gl.createTexture();
    var transTex = gl.createTexture();
    var lightTex = gl.createTexture();
    var specTex = gl.createTexture();

    var cubeTex = gl.createTexture();
    var cubeFrontTex = gl.createTexture();
    var cubeBackTex = gl.createTexture();
    var cubeLeftTex = gl.createTexture();
    var cubeRightTex = gl.createTexture();
    var cubeTopTex = gl.createTexture();
    var cubeBottomTex = gl.createTexture();


    function initCubeMapTexture(texture,ftex,btex,ltex,rtex,ttex,bottomtTex){
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ftex.image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, btex.image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, rtex.image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ltex.image);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ttex.image);
        gl.texImage3D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bottomTex.image);
    }   

    function initLoadedTexture(texture){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var cubePositionsName = gl.createBuffer();
    var cubeIndicesName = gl.createBuffer();
    var cubeTexCoordsName = gl.createBuffer();
    (function initializeCubeMap(){

        var numberOfPoints = 4;
        var positions = new Float32Array(2*numberOfPoints);
        positions[0] = -1.0; positions[1] = -1.0;
        positions[2] =  1.0; positions[3] = -1.0;
        positions[4] =  1.0; positions[5] =  1.0;
        positions[6] = -1.0; positions[7] = 1.0;
        

        var texCoords = new Float32Array(2 * numberOfPoints);
        texCoords[0] =  1.0; texCoords[1] =  1.0;
        texCoords[2] =  0.0; texCoords[3] =  1.0;
        texCoords[4] =  0.0; texCoords[5] =  0.0;
        texCoords[6] =  1.0; texCoords[7] =  1.0;
        
        var indices = new Uint16Array(6);
        indices[0] = 0; indices[1] = 1; indices[2]=3; indices[3]=3;
        indices[4] = 1; indices[5] = 2; 
        
        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionsName);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(cubeVPositionLocation, 2, gl.FLOAT, false, 0, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexCoordsName);
        //gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        //gl.vertexAttribPointer(cubeVTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesName);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    })();


    var numberOfIndices;
    var positionsName = gl.createBuffer();
    var normalsName = gl.createBuffer();
    var texCoordsName = gl.createBuffer();
    var indicesName = gl.createBuffer();

    (function initializeSphere() {
        function uploadMesh(positions, texCoords, indices) {
            // Positions
            gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(positionLocation);
            
            // Normals
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(normalLocation);
            
            // TextureCoords
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(texCoordLocation);

            // Indices
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

        for( var j = 0; j < NUM_HEIGHT_PTS; ++j )
        {
            var inclination = Math.PI * (j / HEIGHT_DIVISIONS);
            for( var i = 0; i < NUM_WIDTH_PTS; ++i )
            {
                var azimuth = 2 * Math.PI * (i / WIDTH_DIVISIONS);
                positions[positionsIndex++] = Math.sin(inclination)*Math.cos(azimuth);
                positions[positionsIndex++] = Math.cos(inclination);
                positions[positionsIndex++] = Math.sin(inclination)*Math.sin(azimuth);
                texCoords[texCoordsIndex++] = i / WIDTH_DIVISIONS;
                texCoords[texCoordsIndex++] = j / HEIGHT_DIVISIONS;
            }
        }

        for( var j = 0; j < HEIGHT_DIVISIONS; ++j )
        {
            var index = j*NUM_WIDTH_PTS;
            for( var i = 0; i < WIDTH_DIVISIONS; ++i )
            {
                    indices[indicesIndex++] = index + i;
                    indices[indicesIndex++] = index + i+1;
                    indices[indicesIndex++] = index + i+NUM_WIDTH_PTS;
                    indices[indicesIndex++] = index + i+NUM_WIDTH_PTS;
                    indices[indicesIndex++] = index + i+1;
                    indices[indicesIndex++] = index + i+NUM_WIDTH_PTS+1;
            }
        }

        uploadMesh(positions, texCoords, indices);
        numberOfIndices = indicesIndex;
    })();

    var time = 0;
    var mouseLeftDown = false;
    var mouseRightDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    function handleMouseDown(event) {
        if( event.button == 2 ) {
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
        
        if( mouseLeftDown )
        {
            azimuth += 0.01 * deltaX;
            elevation += 0.01 * deltaY;
            elevation = Math.min(Math.max(elevation, -Math.PI/2+0.001), Math.PI/2-0.001);
        }
        else
        {
            radius += 0.01 * deltaY;
            radius = Math.min(Math.max(radius, 2.0), 10.0);
        }
        eye = sphericalToCartesian(radius, azimuth, elevation);
        view = mat4.create();
        mat4.lookAt(eye, center, up, view);

        lastMouseX = newX;
        lastMouseY = newY;
    }

    canvas.onmousedown = handleMouseDown;
    canvas.oncontextmenu = function(ev) {return false;};
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;


    function animate() {
        ///////////////////////////////////////////////////////////////////////////
        // Update

        var model = mat4.create();
        mat4.identity(model);
        mat4.rotate(model, 23.4/180*Math.PI, [0.0, 0.0, 1.0]);
        mat4.rotate(model, Math.PI, [1.0, 0.0, 0.0]);
        mat4.rotate(model, -time, [0.0, 1.0, 0.0]);
        var mv = mat4.create();
        mat4.multiply(view, model, mv);

        var invTrans = mat4.create();
        mat4.inverse(mv, invTrans);
        mat4.transpose(invTrans);

        var lightdir = vec3.create([1.0, 0.0, 1.0]);
        var lightdest = vec4.create();
        vec3.normalize(lightdir);
        mat4.multiplyVec4(view, [lightdir[0], lightdir[1], lightdir[2], 0.0], lightdest);
        lightdir = vec3.createFrom(lightdest[0],lightdest[1],lightdest[2]);
        vec3.normalize(lightdir);
        var resInverse = vec2.create([1.0/1024.0,1.0/512.0]);

        var invPersp = mat4.create();
        mat4.inverse(persp, invPersp);
        var invMV = mat4.create();
        mat4.inverse(view,invMV);
        
        var invMVP = mat4.create();
        mat4.multiply(invMV,invPersp,invMVP); 

        ///////////////////////////////////////////////////////////////////////////
        // RenderCubeMap quad
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(cubeMapProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionsName);
        gl.vertexAttribPointer(cubeVPositionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexCoordsName);
        //gl.vertexAttribPointer(cubeVTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesName);
        gl.uniformMatrix4fv(u_cubeModelViewLocation, false, mv);
        gl.uniformMatrix4fv(u_cubePerspLocation, false, persp);
        gl.uniformMatrix4fv(u_CubeTransformMatrixLocation,false,invMVP);
        gl.enableVertexAttribArray(cubeVPositionLocation);
        gl.enableVertexAttribArray(cubeVTexCoordLocation);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTex);
        gl.uniform1i(u_CubeTextureLocation, 0);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT,0);
        gl.disableVertexAttribArray(cubeVPositionLocation);
        gl.disableVertexAttribArray(cubeVTexCoordLocation);
        ///////////////////////////////////////////////////////////////////////////
        // Render
        // Render
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(normalLocation);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(u_ModelLocation, false, model);
        gl.uniformMatrix4fv(u_ViewLocation, false, view);
        gl.uniformMatrix4fv(u_PerspLocation, false, persp);
        gl.uniformMatrix4fv(u_InvTransLocation, false, invTrans);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);
        
        gl.uniform3fv(u_CameraSpaceDirLightLocation, lightdir);
        gl.uniform1f(u_timeLocation,time);
        gl.uniform2fv(u_resInverseLocation,resInverse);

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
        gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_SHORT,0);

        gl.disableVertexAttribArray(texCoordLocation);
        gl.disableVertexAttribArray(normalLocation);
        gl.disableVertexAttribArray(positionLocation);
        time += 0.001;
        window.requestAnimFrame(animate);
    }

    var textureCount = 0;
        
    function initializeTexture(texture, src) {
        texture.image = new Image();
        texture.image.onload = function() {
            initLoadedTexture(texture);

            // Animate once textures load.
            if (++textureCount === 6) {
                animate();
            }
        }
        texture.image.src = src;
    }


function loadCubeMap(base, suffix) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var faces = [["posx", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["negx", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["posy", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["negy", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["posz", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["negz", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var url = base + "-" + faces[i][0] + "." + suffix;
        var face = faces[i][1];
        var image = new Image();
        image.onload = function(texture, face, image, url) {
            return function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(
                   face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(texture, face, image, url);
        image.src = url;
    }
    return texture;
}


    function initializeCubeTexture(texture,ftex,fsrc,btex,bsrc,ltex,lsrc,rtex,rsrc,ttex,tsrc,bottomTex,bottomSrc){
      ftex.image = new Image();
      btex.image = new Image();
      ltex.image = new Image();
      rtex.image = new Image();
      ttex.image = new Image();
      bottomTex.image = new Image();
      var image = new Image();
      image.onload = function() {
          initCubeMapTexture(texture,ftex,btex,ltex,rtex,ttex,bottomTex);
          }
      ftex.image.src = fsrc;
      btex.image.src = bsrc;
      ltex.image.src = lsrc;
      rtex.image.src = rsrc;
      ttex.image.src = tsrc;
      bottomTex.image.src = bottomSrc;
          
    }
   // initializeCubeTexture(cubeTex,cubeFrontTex,"skybox-xpos.jpg",
   //                       cubeBackTex,"skybox-xneg.jpg",
   //                       cubeLeftTex,"skybox-ypos.jpg",
   //                       cubeRightTex,"skybox-yneg.jpg",
   //                       cubeTopTex,"skybox-zpos.jpg",
   //                       cubeBottomTex,"skybox-zneg.jpg");
    cubeTex = loadCubeMap("skybox","jpg");
    initializeTexture(dayTex, "earthmap1024.png");
    initializeTexture(bumpTex, "earthbump1024.png");
    initializeTexture(cloudTex, "earthcloud1024.png");
    initializeTexture(transTex, "earthtrans1024.png");
    initializeTexture(lightTex, "earthlight1024.png");
    initializeTexture(specTex, "earthspec1024.png");
}());

