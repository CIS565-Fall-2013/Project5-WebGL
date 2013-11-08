-------------------------------------------------------------------------------
<center>Project 4: WebGL
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

First wave calculated using a producto of sin and cosine waves

<center>![simplex_wave](https://raw.github.com/josephto/Project5-WebGL/master/simplex_wave.png "screenshots")

Second simplex wave

<center>![wave_wave](https://raw.github.com/josephto/Project5-WebGL/master/wave_wave.png "screenshots")

Third original wave that mimics a wave of water as it experiences initial turbulence and then calms down

<center>![globe](https://raw.github.com/josephto/Project5-WebGL/master/globe.png "screenshots")

A globe render

-------------------------------------------------------------------------------
<center>PERFORMANCE REPORT:
-------------------------------------------------------------------------------

Here's a table with some performance analysis that I conducted on my code. I tested how many secs it took for each frame to rasterize depending on if backface culling was turned on or off. I used the the full stanford dragon model for all these tests.

Number of Faces | With Backface Culling | Without Backface Culling
------------------|------------------------|---------------------
100,000    |  0.017 sec/frame | 0.021 sec/frame
200,000    |  0.024 sec/frame | 0.033 sec/frame
300,000    |  0.033 sec/frame | 0.043 sec/frame
400,000    |  0.041 sec/frame | 0.055 sec/frame
500,000    |  0.052 sec/frame | 0.068 sec/frame
600,000    |  0.064 sec/frame | 0.083 sec/frame
700,000    |  0.074 sec/frame | 0.095 sec/frame
800,000    |  0.087 sec/frame | 0.111 sec/frame
871,000    |  0.095 sec/frame | 0.126 sec/frame

Despite the fact that my backface culling was a naive implementation, it still succeeded in speeding up my code. With the ability to ignore faces that weren't facing the camera, my rasterizer was able to show a rather decent speed up in the amount of time it took to compute and rasterize each frame.