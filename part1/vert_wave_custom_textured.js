(function() {
    "use strict";
    /*global window,document,Float32Array,Uint16Array,mat4,vec3,snoise*/
    /*global getShaderSource,createWebGLContext,createProgram*/

    var NUM_WIDTH_PTS = 128;
    var NUM_HEIGHT_PTS = 128;

    var message = document.getElementById("message");
    var canvas = document.getElementById("canvas");
    var context = createWebGLContext(canvas, message);
    if (!context) {
        return;
    }

    ///////////////////////////////////////////////////////////////////////////

    context.viewport(0, 0, canvas.width, canvas.height);
    context.clearColor(1.0, 1.0, 1.0, 1.0);
    context.enable(context.DEPTH_TEST);

    var persp = mat4.create();
    mat4.perspective(45.0, 0.5, 0.1, 100.0, persp);

    var eye = [2.0, 1.0, 5.0];
    var center = [0.0, 0.0, 0.0];
    var up = [0.0, 0.0, 1.0];
    var view = mat4.create();
    mat4.lookAt(eye, center, up, view);
    var time = 1.0;

    var positionLocation = 0;
    var heightLocation = 1;
    var u_modelViewPerspectiveLocation;
    var u_time;
    var u_cubeTexLocation; 
    var u_sphereTexLocation; 
    var u_rippleCenterLocation;

    (function initializeShader() {
        var program;
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

		var program = createProgram(context, vs, fs, message);
		context.bindAttribLocation(program, positionLocation, "position");
		u_modelViewPerspectiveLocation = context.getUniformLocation(program,"u_modelViewPerspective");
        u_time = context.getUniformLocation(program,"u_time");
        u_rippleCenterLocation = context.getUniformLocation(program,"u_rippleCenter");

        u_cubeTexLocation= context.getUniformLocation(program,"u_cubeTex");
        u_cubeTexLocation= context.getUniformLocation(program,"u_sphereTex");
        context.useProgram(program);
    })();

    var heights;
    var numberOfIndices;
    var rippleCenter;

    (function initializeGrid() {
        function uploadMesh(positions, heights, indices) {
            // Positions
            var positionsName = context.createBuffer();
            context.bindBuffer(context.ARRAY_BUFFER, positionsName);
            context.bufferData(context.ARRAY_BUFFER, positions, context.STATIC_DRAW);
            context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);
            context.enableVertexAttribArray(positionLocation);

            if (heights)
            {
                // Heights
                var heightsName = context.createBuffer();
                context.bindBuffer(context.ARRAY_BUFFER, heightsName);
                context.bufferData(context.ARRAY_BUFFER, heights.length * heights.BYTES_PER_ELEMENT, context.STREAM_DRAW);
                context.vertexAttribPointer(heightLocation, 1, context.FLOAT, false, 0, 0);
                context.enableVertexAttribArray(heightLocation);
            }

            // Indices
            var indicesName = context.createBuffer();
            context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indicesName);
            context.bufferData(context.ELEMENT_ARRAY_BUFFER, indices, context.STATIC_DRAW);
        }

        var WIDTH_DIVISIONS = NUM_WIDTH_PTS - 1;
        var HEIGHT_DIVISIONS = NUM_HEIGHT_PTS - 1;

        var numberOfPositions = NUM_WIDTH_PTS * NUM_HEIGHT_PTS;

        var positions = new Float32Array(2 * numberOfPositions);
        //var indices = new Uint16Array(2 * ((NUM_HEIGHT_PTS * (NUM_WIDTH_PTS - 1)) + (NUM_WIDTH_PTS * (NUM_HEIGHT_PTS - 1))));
        var indices = new Uint16Array( WIDTH_DIVISIONS*HEIGHT_DIVISIONS*6)

        var positionsIndex = 0;
        var indicesIndex = 0;
        var length;

        for (var j = 0; j < NUM_WIDTH_PTS; ++j)
        {
            positions[positionsIndex++] = j /(NUM_WIDTH_PTS - 1);
            positions[positionsIndex++] = 0.0;

            if (j>=1)
            {
                length = positionsIndex / 2;
                //indices[indicesIndex++] = length - 2;
                //indices[indicesIndex++] = length - 1;
            }
        }

        for (var i = 0; i < HEIGHT_DIVISIONS; ++i)
        {
             var v = (i + 1) / (NUM_HEIGHT_PTS - 1);
             positions[positionsIndex++] = 0.0;
             positions[positionsIndex++] = v;

             length = (positionsIndex / 2);
             //indices[indicesIndex++] = length - 1;
             //indices[indicesIndex++] = length - 1 - NUM_WIDTH_PTS;

             for (var k = 0; k < WIDTH_DIVISIONS; ++k)
             {
                 positions[positionsIndex++] = (k + 1) / (NUM_WIDTH_PTS - 1);
                 positions[positionsIndex++] = v;

                 length = positionsIndex / 2;
                 var new_pt = length - 1;
                 //indices[indicesIndex++] = new_pt - 1;  // Previous side
                 //indices[indicesIndex++] = new_pt;

                 //indices[indicesIndex++] = new_pt - NUM_WIDTH_PTS;  // Previous bottom
                 //indices[indicesIndex++] = new_pt;
             }
        }

        for ( var i=0; i<WIDTH_DIVISIONS;++i)
        {
            for ( var j=0; j<HEIGHT_DIVISIONS;++j)
        {
            indices[indicesIndex++] = j*NUM_WIDTH_PTS+i;
            indices[indicesIndex++] = j*NUM_WIDTH_PTS+i+1;
            indices[indicesIndex++] = (j+1)*NUM_WIDTH_PTS+i;
            indices[indicesIndex++] =  (j+1)*NUM_WIDTH_PTS+i;
            indices[indicesIndex++] = j*NUM_WIDTH_PTS+i+1;
            indices[indicesIndex++] = (j+1)*NUM_WIDTH_PTS+i+1;
        }
        }
        
        uploadMesh(positions, heights, indices);
        numberOfIndices = indices.length;
        rippleCenter = vec2.create([0.5,0.5]);
    })();

function loadCubeMap(base, suffix) {
    var texture = context.createTexture();
    context.bindTexture(context.TEXTURE_CUBE_MAP, texture);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MAG_FILTER, context.LINEAR);
    var faces = [["posx", context.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["negx", context.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["posy", context.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["negy", context.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["posz", context.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["negz", context.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var url = base + "_" + faces[i][0] + "." + suffix;
        var face = faces[i][1];
        var image = new Image();
        image.onload = function(texture, face, image, url) {
            return function() {
                context.bindTexture(context.TEXTURE_CUBE_MAP, texture);
                context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
                context.texImage2D(
                   face, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
            }
        }(texture, face, image, url);
        image.src = url;
    }
    return texture;
}

    var cubeTex = loadCubeMap("sky","jpg");
    function initLoadedTexture(texture){
        context.bindTexture(context.TEXTURE_2D, texture);
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, texture.image);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.REPEAT);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.REPEAT);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
        context.bindTexture(context.TEXTURE_2D, null);
    }

    function initializeTexture(texture, src) {
        texture.image = new Image();
        texture.image.onload = function() {
            initLoadedTexture(texture);
        }
        texture.image.src = src;
    }

    var sphereTex = context.createTexture();
    initializeTexture(sphereTex,"earthcloud1024.png");




    (function animate(){
        ///////////////////////////////////////////////////////////////////////////
        // Update

        var model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, [-0.5, -0.5, 0.0]);
        var mv = mat4.create();
        mat4.multiply(view, model, mv);
        var mvp = mat4.create();
        mat4.multiply(persp, mv, mvp);
        time = time+0.1;
        ///////////////////////////////////////////////////////////////////////////
        // Render
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_CUBE_MAP, cubeTex);
        context.uniform1i(u_cubeTexLocation, 0);
        context.activeTexture(context.TEXTURE1);
        context.bindTexture(context.TEXTURE_2D, sphereTex);
        context.uniform1i(u_sphereTexLocation, 1);
        context.uniformMatrix4fv(u_modelViewPerspectiveLocation, false, mvp);
        context.uniform1f(u_time, time);
        context.uniform2fv(u_rippleCenterLocation,rippleCenter);
        context.drawElements(context.TRIANGLES, numberOfIndices, context.UNSIGNED_SHORT,0);

		window.requestAnimFrame(animate);
    })();

}());
