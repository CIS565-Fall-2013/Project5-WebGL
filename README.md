-------------------------------------------------------------------------------
<center>Project 5: WebGL
-------------------------------------------------------------------------------
<center>Fall 2013
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
<center>INTRODUCTION:
-------------------------------------------------------------------------------
This project is an introductory project into the world of GLSL. In the first part of this project, I implemented a GLSL vertex shader as part of a WebGL demo. I created three dynamic wave animations using code that runs entirely on the GPU.

In the second part of this project, I implemented a GLSL fragment shader to render an interactive globe in WebGL. This includes texture blending, bump mapping, specular masking, and adding a cloud layer.

-------------------------------------------------------------------------------
<center>RENDERS:
-------------------------------------------------------------------------------

Here are some renders:

<center>![vert_wave](https://raw.github.com/josephto/Project5-WebGL/master/vert_wave.png "screenshots")

First wave calculated using a producto of sin and cosine waves. Link: http://josephto.github.io/Project5-WebGL/part1/vert_wave.html

<center>![simplex_wave](https://raw.github.com/josephto/Project5-WebGL/master/simplex_wave.png "screenshots")

Second simplex wave. Link: http://josephto.github.io/Project5-WebGL/part1/simplex_wave.html

<center>![wave_wave](https://raw.github.com/josephto/Project5-WebGL/master/wave_wave.png "screenshots")

Third original wave that mimics a wave of water as it experiences initial turbulence and then calms down. The screen shot doesn't really depict the motion of the wave. Its better to watch the video. Link: http://josephto.github.io/Project5-WebGL/part1/wave_wave.html

<center>![globe](https://raw.github.com/josephto/Project5-WebGL/master/globe.png "screenshots")

A globe render. Link: http://josephto.github.io/Project5-WebGL/part2/frag_globe.html

-------------------------------------------------------------------------------
<center>PERFORMANCE REPORT:
-------------------------------------------------------------------------------

It was hard for me to figure out how exactly to do a good performance evaluation for this project so I just printed out the FPS for each of the programs. The table is as follows:

Program | Frames per second 
------------------|------------------------
Sin/Cos Wave | around 36 fps
Simplex Wave | around 38 fps
Wave Wave | around 37 fps
Globe | around 33 fps