-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
NOTE:
-------------------------------------------------------------------------------
This project requires any graphics card with support for a modern OpenGL 
pipeline. Any AMD, NVIDIA, or Intel card from the past few years should work 
fine, and every machine in the SIG Lab and Moore 100 is capable of running 
this project.

This project also requires a WebGL capable browser. The project is known to 
have issues with Chrome on windows, but Firefox seems to run it fine.

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
In this project, I have implemented vertex and fragment shaders in WebGL.
There are two parts to this project:
- Part1: Deforms a simple grid of points using vertex shaders
- Part2: Renders a globe with fragment shaders

-------------------------------------------------------------------------------
CONTENTS:
-------------------------------------------------------------------------------
The Project4 root directory contains the following subdirectories:
	
* part1/ contains the base code for the Wave Vertex Shader.
* part2/ contains the base code for the Globe Fragment Shader.
* resources/ contains the screenshots found in this readme file.

-------------------------------------------------------------------------------
PART 1:
-------------------------------------------------------------------------------

To view the WebGL demo for any of the following, please click the image,


* A sin-wave based vertex shader:

```glsl
float s_contrib = sin(position.x*2.0*3.14159 + u_time);
float t_contrib = cos(position.y*2.0*3.14159 + u_time);
float height = s_contrib*t_contrib;
```

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/sinWaveGrid.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave.html)

* A simplex noise based vertex shader:

```glsl
vec2 simplexVec = vec2(u_time, position);
float s_contrib = snoise(simplexVec);
float t_contrib = snoise(vec2(s_contrib,u_time));
```
[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/oceanWave.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_simplex.html)

* Custom vertex shader
I tried implementing a ripple-like effect with sin waves radially moving outwards from a point.

```glsl
float radius = sqrt( (position.x-xorigin)*(position.x-xorigin) + (position.y-yorigin)*(position.y-yorigin));
height = 0.5/u_time*sin(freq*radius - u_time);
```
I referred http://www.gamasutra.com/view/feature/131530/refractive_texture_mapping_part_.php?page=3 for the math.

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/ripple.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_ custom.html)

With env cube textures,

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/ripple_textured.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_ custom_textured.html)


-------------------------------------------------------------------------------
PART 2: 
-------------------------------------------------------------------------------

Fragment shader to simulate the look of a globe with,

* Bump mapped terrain
* Rim lighting to simulate atmosphere
* Night-time lights on the dark side of the globe
* Specular mapping
* Moving clouds

Apart from this, I attempted env cube maps with a single quad and ran into some issue. Still need to look into that.

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/globe.png)](http://vimanyu.github.io/Project5-WebGL/frag_globe.html)

-------------------------------------------------------------------------------
THIRD PARTY CODE: 
-------------------------------------------------------------------------------

For environment cube mapping, I referred,
https://www.khronos.org/registry/webgl/sdk/demos/google/shiny-teapot/index.html


