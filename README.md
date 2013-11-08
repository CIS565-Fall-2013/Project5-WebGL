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

<center>![dragon diffuse](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/dragonDiff.png "screenshots")

Diffuse full stanford dragon

<center>![dragon specular](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/dragonSpec.png "screenshots")

Specular full stanford dragon

<center>![dragon color interpolation diffuse](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/dragonColorInterpDiff.png "screenshots")

Diffuse color interpolation stanford dragon

<center>![dragon color interpolation specular](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/dragonColorInterpSpec.png "screenshots")

Specular color interpolation stanford dragon

<center>![bunny normals diffuse](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/bunnyNormalsDiff.png "screenshots") 

Diffuse bunny colored with normals

<center>![cow colored with normals](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/cowNormals.png "screenshots")

Cow colored with just normals

<center>![diffuse skull](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/skullDiff.png "screenshots")

Diffuse Skull

Here's a video: http://www.youtube.com/watch?v=WD7VULD4eeU

-------------------------------------------------------------------------------
<center>BUG RENDERS:
-------------------------------------------------------------------------------

Here's a pretty cool specular bug render that I stumbled over when I accidentally flipped my camera to position ray.

<center>![specular dragon bug](https://raw.github.com/josephto/Project4-Rasterizer/master/renders/dragonSpecWeird.png "screenshots")

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