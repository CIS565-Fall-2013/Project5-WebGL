

(function() {
    var Time = 0;
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


    var u_skyboxLocation = new Array();
    var u_skyInvTransLocation;
    var u_skyModelLocation;
    var u_skyViewLocation;
    var u_skyPerspLocation;
    var skypositionLocation;
    var skytexCoordLocation;
    var u_skyCameraSpaceDirLightLocation;   





    var program = new Array();
    (function initializeShader() {
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

        program[0] = createProgram(gl, vs, fs, message);
        positionLocation = gl.getAttribLocation(program[0], "Position");
        normalLocation = gl.getAttribLocation(program[0], "Normal");
        texCoordLocation = gl.getAttribLocation(program[0], "Texcoord");
        u_ModelLocation = gl.getUniformLocation(program[0],"u_Model");
        u_ViewLocation = gl.getUniformLocation(program[0],"u_View");
        u_PerspLocation = gl.getUniformLocation(program[0],"u_Persp");
        u_InvTransLocation = gl.getUniformLocation(program[0],"u_InvTrans");
        u_DayDiffuseLocation = gl.getUniformLocation(program[0],"u_DayDiffuse");
        u_NightLocation = gl.getUniformLocation(program[0],"u_Night");
        u_CloudLocation = gl.getUniformLocation(program[0],"u_Cloud");
        u_CloudTransLocation = gl.getUniformLocation(program[0],"u_CloudTrans");
        u_EarthSpecLocation = gl.getUniformLocation(program[0],"u_EarthSpec");
        u_BumpLocation = gl.getUniformLocation(program[0],"u_Bump");
        u_timeLocation = gl.getUniformLocation(program[0],"u_time");
        u_CameraSpaceDirLightLocation = gl.getUniformLocation(program[0],"u_CameraSpaceDirLight");
        //gl.useProgram(program[0]); 

        //for skybox
        vs = getShaderSource(document.getElementById("skyboxvs"));
        fs = getShaderSource(document.getElementById("skyboxfs"));

        program[1] = createProgram(gl, vs, fs, message);
        skypositionLocation = gl.getAttribLocation(program[1], "Position");
        //skytexCoordLocation = gl.getAttribLocation(program[1], "Texcoord");
        u_skyModelLocation = gl.getUniformLocation(program[1],"u_Model");
        u_skyViewLocation = gl.getUniformLocation(program[1],"u_View");
        u_skyPerspLocation = gl.getUniformLocation(program[1],"u_Persp");
        u_skyInvTransLocation = gl.getUniformLocation(program[1],"u_InvTrans");
        u_skyboxLocation[0] = gl.getUniformLocation(program[1], "u_Skybox");        
        //gl.useProgram(program[1]);        
    })();

    var dayTex   = gl.createTexture();
    var bumpTex  = gl.createTexture();
    var cloudTex = gl.createTexture();
    var transTex = gl.createTexture();
    var lightTex = gl.createTexture();
    var specTex  = gl.createTexture();

    var skyboxTex = gl.createTexture();

    var skyboxfaces = new Array();   


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

    function initLoadedCubeMapTexture(texture, face, image)
    {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    //get drawing cube vectices and index matrix from http://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_06
    var cubePositionBuffer;  
    var cubeIndexBuffer;
    (function initailzeCube(){
        cubePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
        var vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        cubePositionBuffer.itemSize = 3;
        cubePositionBuffer.numItems = 24;   
     

        cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        cubeIndexBuffer.itemSize = 1;
        cubeIndexBuffer.numItems = 36;
    }
    )();


    var numberOfIndices;
    var positionsName;
    var normalsName;
    var texCoordsName;
    var indicesName;

    (function initializeSphere() {
        function uploadMesh(positions, texCoords, indices) {
            // Positions
            positionsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            //gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(positionLocation);
            
            // Normals
            normalsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            //gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(normalLocation);
            
            // TextureCoords
            texCoordsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            //gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
            //gl.enableVertexAttribArray(texCoordLocation);

            // Indices
            indicesName = gl.createBuffer();
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
        var d1 = new Date();
        var startTime = d1.getTime();

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

        
        ///////////////////////////////////////////////////////////////////////////
        // Render
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Render the Earth
        gl.useProgram(program[0]);
        gl.enableVertexAttribArray(positionLocation);
        gl.enableVertexAttribArray(normalLocation);
        gl.enableVertexAttribArray(texCoordLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            

        gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesName);       


        gl.uniformMatrix4fv(u_ModelLocation, false, model);
        gl.uniformMatrix4fv(u_ViewLocation, false, view);
        gl.uniformMatrix4fv(u_PerspLocation, false, persp);
        gl.uniformMatrix4fv(u_InvTransLocation, false, invTrans);

        gl.uniform3fv(u_CameraSpaceDirLightLocation, lightdir);

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
        gl.uniform1f(u_timeLocation, time);
        
        gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_SHORT,0);

        gl.disableVertexAttribArray(positionLocation);
        gl.disableVertexAttribArray(normalLocation);
        gl.disableVertexAttribArray(texCoordLocation);

        //Render skybox
        //scale the box first
        mat4.scale(model, vec3.create([50.0,50.0,50.0]));
        mat4.multiply(view, model, mv);
        
        invTrans = mat4.create();
        mat4.inverse(mv, invTrans);
        mat4.transpose(invTrans);

        gl.useProgram(program[1]);
        gl.enableVertexAttribArray(skypositionLocation);        
       

        gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
        gl.vertexAttribPointer(skypositionLocation, cubePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
      
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);    

        gl.uniformMatrix4fv(u_skyModelLocation, false, model);
        gl.uniformMatrix4fv(u_skyViewLocation, false, view);
        gl.uniformMatrix4fv(u_skyPerspLocation, false, persp);
        gl.uniformMatrix4fv(u_skyInvTransLocation, false, invTrans);
       
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTex);
        gl.uniform1i(u_skyboxLocation[0], 0);

        gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(skypositionLocation);       

        var d2 = new Date();
        var endTime = d2.getTime();
        var TimeDelta = endTime/1000.0 - startTime/1000.0;
        //var fps = 1 / TimeDelta;
        console.debug(TimeDelta); 
       

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

    initializeTexture(dayTex, "earthmap1024.png");
    initializeTexture(bumpTex, "earthbump1024.png");
    initializeTexture(cloudTex, "earthcloud1024.png");
    initializeTexture(transTex, "earthtrans1024.png");
    initializeTexture(lightTex, "earthlight1024.png");
    initializeTexture(specTex, "earthspec1024.png");
    
    function loadCubeTextrue(texture, faces)
    {
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i][0];
            var image = new Image();            
            image.onload =  function(texture, face, image) {
                return function() {
                    //connect the cube map and return as one texture
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                    gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }                
            } (texture, face, image);
            image.src = faces[i][1];
        }        
    }

    //front back up down right left
    skyboxfaces[0] = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, "space_ft.JPG"];
    skyboxfaces[1] = [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, "space_bk.JPG"];
    skyboxfaces[2] = [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, "space_up.JPG"];
    skyboxfaces[3] = [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, "space_dn.JPG"];
    skyboxfaces[4] = [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, "space_dn.JPG"];
    skyboxfaces[5] = [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, "space_dn.JPG"];

    loadCubeTextrue(skyboxTex, skyboxfaces);


   

}());


