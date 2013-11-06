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

*Live Globe Render: http://rarietta.github.io/Project5-WebGL/part2/frag_globe.html  
*Live Wave Shader 1: http://rarietta.github.io/Project5-WebGL/part1/vert_wave.html  
*Live Wave Shader 2: http://rarietta.github.io/Project5-WebGL/part1/vert_simplex.html  
*Live Wave Shader 3: http://rarietta.github.io/Project5-WebGL/part1/vert_custom.html  
 
------------------------------------------------------------------------------------
PART 1: GLSL Vertex Shader Waves
====================================================================================

As noted above, please follow the links to view the live shaders in action. The
quality of the following screen capture videos is not as good as the real thing.

-------------------------------------------------------------------------------
Sine-Based Wave
-------------------------------------------------------------------------------

This first vertex shader implements a sin-based noise funtion varying over
time. As is the case with all subsequent vertex shaders in this readme, the 
grid has been colored with a gradient value from red (minimum value) to 
blue (maximum value).
 
[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_001.png)] (http://rarietta.github.io/Project5-WebGL/part1/vert_wave.html)

-------------------------------------------------------------------------------
Simplex Noise Wave
-------------------------------------------------------------------------------

Instead of a sin-based noise function, this vertex shader implements a
simplex noise function.

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_002.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/video_002.avi)

-------------------------------------------------------------------------------
Custom Wave
-------------------------------------------------------------------------------

This third vertex shader is also a sin-based shader. Although it is similar
to the first shader shown in terms of computation, the generation of this
shader was a crucial stepping stone in the development of the noise-based
wave generation in the WebGL globe fragment shader below, and for that
reason I have chosen to include it as my third vertex noise shader.

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/preview_003.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/waves/video_003.avi)

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

This project began in the bare-bones state seen above, with a simple sphere
surface texture mapped with the globe.
 
-------------------------------------------------------------------------------
Diffuse & Specular Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_002.png)

From the texture mapping above, along with the normal and position data at
each fragment, diffuse and specular lighting calculations were simply
performed for each fragment.

-------------------------------------------------------------------------------
Specular Mask for Land Masses
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_003.png)

Using a second texture map of the globe as a mask, in which land mass points
were colored black and water surface points were colored white, I was able to
restrict the specular highlights to only the ocean surfaces. Whenever the 
luminance of a texel on the mask was under a very low threshold, the
specular component of the lighting calculation was ignored, thus leading
to flat shading on solid land masses.
 
-------------------------------------------------------------------------------
Night-Time Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_004.png)

The next step involved mapping a nightime globe texture to any point where
the diffuse lighting calculation was zero. I scaled the diffuse calculations
appropriately to achieve a gradient across the light boundary, and gamma
multiplied the nighttime texture to bring out the luminance. The values
across the boundary were linearly interpolated between the night and day
globe textures.

-------------------------------------------------------------------------------
Bump Mapping
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_005.png)

To achieve bump mapping in my fragment shader, I used yet another globe
texture map. The luminance at each texel corresponded to the elevation of
the fragment. By calculating the difference between any one texel and its
neighbors in the right and up s-t-coordinate grid directions, I calculated
the gradients in the "east" and "north" model directions. These could
then be converted to eye space and used to perturb the fragment normal
for diffuse lighting calculations.

-------------------------------------------------------------------------------
Noise-Generated Ocean Waves & Currents (Additional Feature)
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_006.png)

Using a variation of the third sine-based wave shader above, converted to
use texture coordinates. Furthermore, I created a new texture map to
reflect the ocean elevation and currents, seen below this description.
Using these luminance values as another coefficient in the wave calculations,
I was able to make the strongest and most frequent waves occur in parallel
and close to the shore lines and along current paths, while the more gradual
and less frequent waves occurred out at sea.

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/waveintensity.png) 

-------------------------------------------------------------------------------
Global Rim Lighting
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_007.png)

Rim lighting was calculated at each fragment using the dot product of the
fragment normal and model space position to replicate an atmospheric lighting
effect.

-------------------------------------------------------------------------------
Animated Cloud Cover
-------------------------------------------------------------------------------

![Screenshot] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/screenshot_008.png)

Cloud cover was calculated using two more texture maps, one for the cloud
color and one for the cloud layer transparency at each fragment. This
was mixed with the underlying surface luminance values.

-------------------------------------------------------------------------------
Final WebGL Render Video
-------------------------------------------------------------------------------

Here is a screen capture video of the final rendered globe running in the
browser. As noted above, this video is useful for demonstration but greatly
lacks in quality and framerate. To view the live demonstration of the globe,
please follow this link: 

http://rarietta.github.io/Project5-WebGL/part2/frag_globe.html

[![Video](https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/preview_001.png)] (https://raw.github.com/rarietta/Project5-WebGL/master/readme_imgs/globe/video_001.avi)

------------------------------------------------------------------------------------
ACKNOWLEDGMENTS:
====================================================================================
This project was built on a basic framework provided by Patrick Cozzi and Liam
Boone for CIS 565 at The University of Pennsylvania, Fall 2013.