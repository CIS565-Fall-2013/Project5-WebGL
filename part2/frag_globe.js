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
	var program;
	//skybox
	var spositionLocation;
	var snormalLocation;
	var stexCoordLocation;
	var u_frontLoc;
	var u_backLoc;
	var u_leftLoc;
	var u_rightLoc;
	var u_bottomLoc;
	var u_topLoc;
	
	var u_sModelLocation;
    var u_sViewLocation;
    var u_sPerspLocation;
	var program2;


    (function initializeShader() {
        var vs = getShaderSource(document.getElementById("vs"));
        var fs = getShaderSource(document.getElementById("fs"));

        program = createProgram(gl, vs, fs, message);
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

       // gl.useProgram(program);
		
		var skyvs = getShaderSource(document.getElementById("skyvs"));
		var skyfs = getShaderSource(document.getElementById("skyfs"));
		program2 = createProgram(gl,skyvs,skyfs,message);
		spositionLocation = gl.getAttribLocation(program2,"Position");
		stexCoordLocation = gl.getAttribLocation(program2,"Texcoord");
		u_frontLoc = gl.getUniformLocation(program2,"u_Front");
		u_backLoc = gl.getUniformLocation(program2,"u_Back");
		u_leftLoc = gl.getUniformLocation(program2,"u_Left");
		u_rightLoc = gl.getUniformLocation(program2,"u_Right");
		u_bottomLoc = gl.getUniformLocation(program2,"u_Bottom");
		u_topLoc = gl.getUniformLocation(program2,"u_Top");
		u_sModelLocation = gl.getUniformLocation(program2,"u_Model");
        u_sViewLocation = gl.getUniformLocation(program2,"u_View");
        u_sPerspLocation = gl.getUniformLocation(program2,"u_Persp");
		
    })();

	

    var dayTex   = gl.createTexture();
    var bumpTex  = gl.createTexture();
    var cloudTex = gl.createTexture();
    var transTex = gl.createTexture();
    var lightTex = gl.createTexture();
    var specTex  = gl.createTexture();
	
	var frontTex = gl.createTexture();
	var backTex = gl.createTexture();
	var leftTex = gl.createTexture();
	var rightTex = gl.createTexture();
	var bottomTex = gl.createTexture();
	var topTex = gl.createTexture();


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
	
	function initLoadedsTexture(texture){
		gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
	}

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
           // gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
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

	//TODO: Initialize Skybox
	var cubeIndicesNum = 0;
	var spositionsName;
	var stexCoordsName;
	var sindicesName;
	var frind; var baind; var lind; var rind; var boind; var tind;
	var ftex; var batex; var ltex; var rtex; var botex; var ttex;
	var fpositions; var bapositions; var lpositions;	var rpositions;	var bopositions;	var tpositions;
	(function initializeCube(){
		/*function uploadMesh(positions,texCoords,indices){
			
			spositionsName = gl.createBuffer();			
            gl.bindBuffer(gl.ARRAY_BUFFER, spositionsName);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(spositionLocation);
			
			 // TextureCoords
            stexCoordsName = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, stexCoordsName);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(stexCoordLocation);

            // Indices
            sindicesName = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sindicesName);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		}*/
		
		var faceNum = 2;
		//var verticeNum = faceNum * 3;
		var verticeNum = 4;
		var cubePositions = new Float32Array(3 * verticeNum);
		var cubeTexcoord = new Float32Array(2 * verticeNum);
		var cubeIndices = new Uint16Array(3 * faceNum);
		
		//front face
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = -0.5; //left bottom
		cubePositions[posIdx ++] = -0.5;
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;		
		
		cubePositions[posIdx ++] = -0.5; //left top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right bottom
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		fpositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, fpositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(fpositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(fpositions);		
		 // TextureCoords
		ftex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ftex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(ftex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(ftex);

		// Indices
		frind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		//back face	
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = -0.5; //left bottom
		cubePositions[posIdx ++] = -0.5;
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = -0.5; //left top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;
		
		cubePositions[posIdx ++] = 0.5;  //right top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right bottom
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		bapositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, bapositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(bapositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(bapositions);		
		 // TextureCoords
		batex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, batex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(batex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(batex);

		// Indices
		baind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, baind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		//left face
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = -0.5; //left bottom
		cubePositions[posIdx ++] = -0.5;
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = -0.5; //left top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = -0.5;  //right top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = -0.5;  //right bottom
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	

		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		lpositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, lpositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(lpositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(lpositions);		
		 // TextureCoords
		ltex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ltex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(ltex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(ltex);

		// Indices
		lind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		//right face
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = 0.5; //left bottom
		cubePositions[posIdx ++] = -0.5;
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = 0.5; //left top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right bottom
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		rpositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, rpositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(rpositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(rpositions);		
		 // TextureCoords
		rtex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, rtex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(rtex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(rtex);

		// Indices
		rind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		//bottom
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = -0.5; //left bottom
		cubePositions[posIdx ++] = -0.5;
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = -0.5; //left top
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right top
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right bottom
		cubePositions[posIdx ++] = -0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		bopositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, bopositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(bopositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(bopositions);		
		 // TextureCoords
		botex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, botex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(botex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(botex);

		// Indices
		boind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		//top
		var posIdx = 0;
		var texIdx = 0;
		var indicIdx = 0;
		cubePositions[posIdx ++] = -0.5; //left bottom
		cubePositions[posIdx ++] = 0.5;
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 1.0;	
		
		cubePositions[posIdx ++] = -0.5; //left top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 1.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right top
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = 0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 0.0;	
		
		cubePositions[posIdx ++] = 0.5;  //right bottom
		cubePositions[posIdx ++] = 0.5; 
		cubePositions[posIdx ++] = -0.5; 
		cubeTexcoord[texIdx ++] = 0.0;
		cubeTexcoord[texIdx ++] = 1.0;
		
		//indices		
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 1;
		cubeIndices[indicIdx++] = 2;
		cubeIndices[indicIdx++] = 3;
		cubeIndices[indicIdx++] = 0;
		cubeIndices[indicIdx++] = 2;	
		
		tpositions = gl.createBuffer();			
		gl.bindBuffer(gl.ARRAY_BUFFER, tpositions);
		gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(tpositions, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(tpositions);		
		 // TextureCoords
		ttex = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ttex);
		gl.bufferData(gl.ARRAY_BUFFER, cubeTexcoord, gl.STATIC_DRAW);
		gl.vertexAttribPointer(ttex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(ttex);

		// Indices
		tind = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tind);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
		
		/*var indicIdx = 0;
		for(var i = 0;i<faceNum / 2; ++i)
		{
			cubeIndices[indicIdx++] = i*4;
			cubeIndices[indicIdx++] = i*4+1;
			cubeIndices[indicIdx++] = i*4+2;
			cubeIndices[indicIdx++] = i*4+3;
			cubeIndices[indicIdx++] = i*4;
			cubeIndices[indicIdx++] = i*4+2;			
		}
	
		uploadMesh(cubePositions,cubeTexcoord,cubeIndices);*/
		cubeIndicesNum = indicIdx;
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

        ///////////////////////////////////////////////////////////////////////////
        // Render
		gl.useProgram(program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionsName);
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsName);
		gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsName);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordLocation);
		
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
        gl.drawElements(gl.TRIANGLES, numberOfIndices, gl.UNSIGNED_SHORT,0);
	
		
		//draw skybox
		var modelSky = mat4.create();
		mat4.identity(modelSky);
		mat4.rotate(modelSky, -90.0, [1.0, 0.0, 0.0]);
		mat4.rotate(modelSky, 60.0, [0.0, 1.0, 0.0]);
		mat4.scale(modelSky,[22.0,22.0,22.0]);
		var mv = mat4.create();
		mat4.multiply(view,modelSky,mv);
		
		gl.useProgram(program2);
			
		
		//front face
		gl.bindBuffer(gl.ARRAY_BUFFER,fpositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, ftex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
		
		
		gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, frontTex);
        gl.uniform1i(u_frontLoc, 6);
		
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
		//back
		gl.bindBuffer(gl.ARRAY_BUFFER,bapositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, batex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, baind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
		
		
		gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, backTex);
        gl.uniform1i(u_frontLoc, 7);
		
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
		//left
		gl.bindBuffer(gl.ARRAY_BUFFER,lpositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, ltex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
		
		
		gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_2D, leftTex);
        gl.uniform1i(u_frontLoc, 8);
		
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
		//right
		gl.bindBuffer(gl.ARRAY_BUFFER,rpositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, rtex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
		
		
		gl.activeTexture(gl.TEXTURE9);
        gl.bindTexture(gl.TEXTURE_2D, rightTex);
        gl.uniform1i(u_frontLoc, 9);	
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
		//top
		gl.bindBuffer(gl.ARRAY_BUFFER,tpositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, ttex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
	
		gl.activeTexture(gl.TEXTURE10);
        gl.bindTexture(gl.TEXTURE_2D, topTex);
        gl.uniform1i(u_frontLoc, 10);	
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
		//bottom
		gl.bindBuffer(gl.ARRAY_BUFFER,bopositions);
		gl.vertexAttribPointer(spositionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(spositionLocation);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, botex);
		gl.vertexAttribPointer(stexCoordLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(stexCoordLocation);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boind);
		
		gl.uniformMatrix4fv(u_sModelLocation, false, modelSky);
        gl.uniformMatrix4fv(u_sViewLocation, false, view);
        gl.uniformMatrix4fv(u_sPerspLocation, false, persp);
	
		gl.activeTexture(gl.TEXTURE10);
        gl.bindTexture(gl.TEXTURE_2D, bottomTex);
        gl.uniform1i(u_frontLoc, 10);	
		gl.drawElements(gl.TRIANGLES,cubeIndicesNum,gl.UNSIGNED_SHORT,0);
		
        time += 0.001;
		//console.log(time);
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
	
	function initializesTexture(texture,src){
		texture.image = new Image();
        texture.image.onload = function() {
            initLoadedsTexture(texture);
        }
        texture.image.src = src;
	}
	
	/*initializesTexture(frontTex, "front.png");
	initializesTexture(backTex, "back.png");
	initializesTexture(leftTex, "left.png");
	initializesTexture(rightTex, "right.png");
	initializesTexture(topTex, "top.png");
	initializesTexture(bottomTex, "bottom.png");*/
	initializesTexture(frontTex, "Front.png");
	initializesTexture(backTex, "Back.png");
	initializesTexture(leftTex, "Left.png");
	initializesTexture(rightTex, "Right.png");
	initializesTexture(topTex, "Up.png");
	initializesTexture(bottomTex, "Down.png");
	
}());
