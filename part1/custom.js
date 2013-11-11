(function() {
    "use strict";
    /*global window,document,Float32Array,Uint16Array,mat4,vec3,snoise*/
    /*global getShaderSource,createWebGLContext,createProgram*/

    var NUM_WIDTH_PTS = 32;
    var NUM_HEIGHT_PTS = 32;

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

    var eye = [2.0, 1.0, 3.0];
    var center = [0.0, 0.0, 0.0];
    var up = [0.0, 0.0, 1.0];
    var view = mat4.create();
    var eclipseTime = 0;;

    var permutation  = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
                        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
                        247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
                        57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
                        74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
                        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
                        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
                        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
                        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
                        207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
                        119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
                        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
                        218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
                        81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
                        184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
                        222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180 ];

    var grad = [  1,1,0,    -1,1,0,    1,-1,0,    -1,-1,0,

                      1,0,1,    -1,0,1,    1,0,-1,    -1,0,-1,

                      0,1,1,    0,-1,1,    0,1,-1,    0,-1,-1,

                      1,1,0,    0,-1,1,    -1,1,0,    0,-1,-1 ];

    var permArray = new Uint8Array( permutation );
    var gradArray = new Uint8Array( grad );

    mat4.lookAt(eye, center, up, view);

    var positionLocation = 0;
    var heightLocation = 1;
    var u_modelViewPerspectiveLocation;
    var u_timeLocation;
    
    var u_permTexLoc;
    var u_gradTexLoc;
    var permTex = context.createTexture();
    var gradTex = context.createTexture();
    

    (function initializeShader() {
        var program;
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

        var program = createProgram(context, vs, fs, message);
        context.bindAttribLocation(program, positionLocation, "position");
        u_modelViewPerspectiveLocation = context.getUniformLocation(program,"u_modelViewPerspective");
        
        u_timeLocation = context.getUniformLocation( program, "u_time" );
        u_permTexLoc = context.getUniformLocation( program, "u_permutation" );
        u_gradTexLoc = context.getUniformLocation( program, "u_grad" );
        context.useProgram(program);
    })();

    var heights;
    var numberOfIndices;

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
        var indices = new Uint16Array(2 * ((NUM_HEIGHT_PTS * (NUM_WIDTH_PTS - 1)) + (NUM_WIDTH_PTS * (NUM_HEIGHT_PTS - 1))));

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
                indices[indicesIndex++] = length - 2;
                indices[indicesIndex++] = length - 1;
            }
        }

        for (var i = 0; i < HEIGHT_DIVISIONS; ++i)
        {
             var v = (i + 1) / (NUM_HEIGHT_PTS - 1);
             positions[positionsIndex++] = 0.0;
             positions[positionsIndex++] = v;

             length = (positionsIndex / 2);
             indices[indicesIndex++] = length - 1;
             indices[indicesIndex++] = length - 1 - NUM_WIDTH_PTS;

             for (var k = 0; k < WIDTH_DIVISIONS; ++k)
             {
                 positions[positionsIndex++] = (k + 1) / (NUM_WIDTH_PTS - 1);
                 positions[positionsIndex++] = v;

                 length = positionsIndex / 2;
                 var new_pt = length - 1;
                 indices[indicesIndex++] = new_pt - 1;  // Previous side
                 indices[indicesIndex++] = new_pt;

                 indices[indicesIndex++] = new_pt - NUM_WIDTH_PTS;  // Previous bottom
                 indices[indicesIndex++] = new_pt;
             }
        }

        uploadMesh(positions, heights, indices);
        numberOfIndices = indices.length;
    })();

 
    (function animate(){
        ///////////////////////////////////////////////////////////////////////////
        // Update
        //console.time( "Matrix Setup");
        var model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, [-0.5, -0.5, 0.0]);
        var mv = mat4.create();
        mat4.multiply(view, model, mv);
        var mvp = mat4.create();
        mat4.multiply(persp, mv, mvp);
        //console.timeEnd( "Matrix Setup");
        ///////////////////////////////////////////////////////////////////////////
        // Render
        //console.time( "screen clear");
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        //console.timeEnd( "screen clear");
        //console.time( "shader val prepare");
        //setup textures
        context.activeTexture( context.TEXTURE0 );
        context.bindTexture( context.TEXTURE_2D, permTex );
        context.uniform1i( u_permTexLoc, 0 );

        context.activeTexture( context.TEXTURE1 );
        context.bindTexture( context.TEXTURE_2D, gradTex );
        context.uniform1i( u_gradTexLoc, 1 );

        //increae delta Time
        context.uniform1f( u_timeLocation, eclipseTime );
        eclipseTime += 0.01;
        context.uniformMatrix4fv(u_modelViewPerspectiveLocation, false, mvp);
        //console.timeEnd( "shader val prepare");
        //console.time("Draw call");
        context.drawElements(context.LINES, numberOfIndices, context.UNSIGNED_SHORT,0);
        //console.timeEnd("Draw call");
        window.requestAnimFrame(animate);
        
    })();
    
    function initializeTexture( texture, data, format, width, height )
    {
        context.bindTexture(context.TEXTURE_2D, texture);

        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data );
        context.texImage2D( context.TEXTURE_2D, 0, format, width, height, 0, format, context.UNSIGNED_BYTE, data )
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST );
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST );

        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.REPEAT );
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE );
        context.bindTexture(context.TEXTURE_2D, null);
    }

    initializeTexture( permTex, permArray, context.ALPHA, 256, 1 );
    initializeTexture( gradTex, gradArray, context.RGB, 16, 1 );
}());
