------------------------------------------------------------------------------------
Project 5: WebGL
====================================================================================
Ricky Arietta Fall 2013
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_final.png)

------------------------------------------------------------------------------------
INTRODUCTION:
====================================================================================

This project explores GLSL and WebGL in two parts:

The first part of this project implements a series of GLSL vertex shaders as 
part of a WebGL demo. I have created three dynamic wave animation using code 
that runs entirely on the GPU. They use a variety of noise functions to 
simulate waves on a grid of vertices.

In the second part of this project, I have implemented a GLSL fragment shader
to render an interactive globe in WebGL. This include texture blending, bump 
mapping, specular masking, adding an animated cloud layer, and ocean waves and
currents generated via noise functions that are dependent on the land mass
geometry.

------------------------------------------------------------------------------------
NOTES:
====================================================================================

Please note that while this writeup contains multiple screenshots and videos
of the project, the screen capture quality and framerate and both greatly
depreciated from the actual running program. To view the actual renders live,
please follow the appropriate links below:

*Live Globe Render:
*Live Wave Shader 1:
*Live Wave Shader 2:
*Live Wave Shader 3:
 
------------------------------------------------------------------------------------
PART 1: GLSL Vertex Shader Waves
====================================================================================

As noted above, please follow the links to view the live shaders in action. The
quality of the following screen capture videos is not as good as the real thing.

-------------------------------------------------------------------------------
Subtitle1
-------------------------------------------------------------------------------

This first vertex shader implements a sin-based noise funtion varying over
time. As is the case with all subsequent vertex shaders in this readme, the 
grid has been colored with a gradient value from red (minimum value) to 
blue (maximum value).
 
[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_001.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/video_001.png)

-------------------------------------------------------------------------------
Subtitle2
-------------------------------------------------------------------------------

Instead of a sin-based noise function, this vertex shader implements a
simplex noise function.

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_002.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/video_002.png)

-------------------------------------------------------------------------------
Subtitle3
-------------------------------------------------------------------------------

This third vertex shader is also a sin-based shader. Although it is similar
to the first shader shown in terms of computation, the generation of this
shader was a crucial stepping stone in the development of the noise-based
wave generation in the WebGL globe fragment shader below, and for that
reason I have chosen to include it as my third vertex noise shader.

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_003.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/video_003.png)

-------------------------------------------------------------------------------
Subtitle4
-------------------------------------------------------------------------------

------------------------------------------------------------------------------------
PART 2: WebGL Interactive Globe Rendering with GLSL Fragment Shaders
====================================================================================

This writeup will go through the generation of an animated, interactive 
globe using GLSL fragment shaders and WebGL, individually exploring each 
stage and feature implemented in the final rendering.

-------------------------------------------------------------------------------
Texture Mapped Sphere
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_001.png)

-------------------------------------------------------------------------------
Diffuse & Specular Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_002.png)

-------------------------------------------------------------------------------
Specular Mask for Land Masses
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_003.png)

-------------------------------------------------------------------------------
Night-Time Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_004.png)

-------------------------------------------------------------------------------
Bump Mapping
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_005.png)

-------------------------------------------------------------------------------
Noise-Generated Ocean Waves & Currents (Additional Feature)
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_006.png)

-------------------------------------------------------------------------------
Global Rim Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_007.png)

-------------------------------------------------------------------------------
Noise-Generated Ocean Waves & Currents (Additional Feature)
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_008.png)

-------------------------------------------------------------------------------
Animated Cloud Cover
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_009.png)

-------------------------------------------------------------------------------
Final WebGL Render Video
-------------------------------------------------------------------------------

Here is a screen capture video of the final rendered globe running in the
browser. As noted above, this video is useful for demonstration but greatly
lacks in quality and framerate. To view the live demonstration of the globe,
please follow this link: 

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/preview_001.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/video_001.png)

------------------------------------------------------------------------------------
ACKNOWLEDGMENTS:
====================================================================================
