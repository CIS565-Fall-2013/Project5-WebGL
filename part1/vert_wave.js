(function() {
    "use strict";
    /*global window,document,Float32Array,Uint16Array,mat4,vec3,snoise*/
    /*global getShaderSource,createWebGLContext,createProgram*/

    var NUM_WIDTH_PTS = 256;
    var NUM_HEIGHT_PTS = 256;

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

    //var eye = [2.0, 1.0, 3.0];
	var theta = 45; // 0 - 180
	var phi = 45; 	// 0 - 360
	var radius = 3.741657;
    var center = [0.0, 0.0, 0.0];
	var eye = [ radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta) ]; 
    var up = [0.0, 0.0, 1.0];
    var view = mat4.create();
    mat4.lookAt(eye, center, up, view);

    var positionLocation = 0;
    var heightLocation = 1;
    var u_modelViewPerspectiveLocation;
	var u_timeLocation;
	
	var leftMouseDown = false;
	var rightMouseDown = false;
	var lastMouseX = null;
	var lastMouseY = null;

	var moonRotationMatrix = mat4.create();
	mat4.identity(moonRotationMatrix);

	function handleMouseDown(event) {
	
		if(event.button == 2)
		{
			leftMouseDown = false;
			rightMouseDown = true;
		}
		else
		{
			leftMouseDown = true;
			rightMouseDown = false;
		} 
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;
	}

	function handleMouseUp(event) {
		leftMouseDown = false;
		rightMouseDown = false;
	}

	function handleMouseMove(event) {
		if (!leftMouseDown && !rightMouseDown) {
		  return;
		}
		var newX = event.clientX;
		var newY = event.clientY;

		var deltaX = newX - lastMouseX;
		var deltaY = newY - lastMouseY;
		
		if(leftMouseDown)
		{
			phi = phi - deltaX * 0.003;
				
			theta = theta - deltaY * 0.005;
			
			if(theta < 0)
				theta = 0.0001;
			else if(theta > 180)
				theta = 179.9999;
		}
		else
		{
			mouseCam.rad -= (0.001*diffy);
			if(mouseCam.rad < 0.3)
				mouseCam.rad = 0.3;
		}
		
		eye = [ radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta) ]; 
		mat4.lookAt(eye, center, up, view);
		
		lastMouseX = newX
		lastMouseY = newY;
	}

	canvas.onmousedown = handleMouseDown;
	canvas.oncontextmenu = function(ev) {return false;};
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;	
	
	var u_HeightLocation;
	var u_ColorLocation;
	
	
    (function initializeShader() {
        var program;
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

		var program = createProgram(context, vs, fs, message);
		context.bindAttribLocation(program, positionLocation, "position");
		u_modelViewPerspectiveLocation = context.getUniformLocation(program,"u_modelViewPerspective");

		u_timeLocation = context.getUniformLocation(program, "u_time");
		
		u_HeightLocation = context.getUniformLocation(program, "u_htTex");
		u_ColorLocation = context.getUniformLocation(program, "u_clTex");
		
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
	
	var htTex = context.createTexture();
	var clTex = context.createTexture();
	
	
    (function initTextures() {	
        function initLoadedTexture(texture){
            context.bindTexture(context.TEXTURE_2D, texture);
            context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, 
                               context.UNSIGNED_BYTE, texture.image);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, 
                                  context.LINEAR);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, 
                                  context.LINEAR);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, 
                                  context.REPEAT);
            context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, 
                                  context.REPEAT);
            context.bindTexture(context.TEXTURE_2D, null);
        }
        
        function initializeTexture(texture, src) {
            texture.image = new Image();
            texture.image.onload = function() {
                initLoadedTexture(texture);
            }
             texture.image.src = src;
        }

        initializeTexture(htTex, "tile_noise.jpg");
        //initializeTexture(clTex, "PUT_COLORTEX_NAME.png");
    })();
	
	
    (function animate(){
        ///////////////////////////////////////////////////////////////////////////
        // Update
		
		var d = new Date();
		var millisec = 1000* (60 * d.getMinutes()  + d.getSeconds()) + d.getMilliseconds();
		var time = 1.0/1000 * millisec;
		
        var model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, [-0.5, -0.5, 0.0]);
        var mv = mat4.create();
        mat4.multiply(view, model, mv);
        var mvp = mat4.create();
        mat4.multiply(persp, mv, mvp);

        ///////////////////////////////////////////////////////////////////////////
        // Render
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

		context.uniform1f(u_timeLocation, time);
		//time = 0.1f;
		
        context.uniformMatrix4fv(u_modelViewPerspectiveLocation, false, mvp);
        
		context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, htTex);

        context.drawElements(context.LINES, numberOfIndices, context.UNSIGNED_SHORT,0);

		window.requestAnimFrame(animate);
    })();

}());
