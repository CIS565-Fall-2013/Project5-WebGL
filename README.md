-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
This project contains 2 main portions. The first part is a visualization of various math functions. 
The second portion is an interactive globe with orbiting moon and skybox. Read on for more details!

-------------------------------------------------------------------------------
PART 1 - VISUALIZING FUNCTIONS
-------------------------------------------------------------------------------
For this part, I have implemented shaders for the following using glsl:
* A sin-wave based vertex shader
* A simplex noise based vertex shader
* A custom vertex shader that behaves like waves

-------------------------------------------------------------------------------
PART 2 - GLOBE
-------------------------------------------------------------------------------
* Bump mapped terrain
* Rim lighting to simulate atmosphere
* Night-time lights on the dark side of the globe
* Specular mapping
* Moving clouds
* Orbiting Moon with texture mapping and bump mapping
* Skybox around the entire scene

-------------------------------------------------------------------------------
README
-------------------------------------------------------------------------------
All students must replace or augment the contents of this Readme.md in a clear 
manner with the following:

* A brief description of the project and the specific features you implemented.
* At least one screenshot of your project running.
* A 30 second or longer video of your project running.  To create the video you
  can use http://www.microsoft.com/expression/products/Encoder4_Overview.aspx 
* A performance evaluation (described in detail below).

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------


-------------------------------------------------------------------------------
REFERENCES
-------------------------------------------------------------------------------
For doing rim lighting, [this article](http://www.fundza.com/rman_shaders/surface/fake_rim/fake_rim1.html) was referred to. 

I also consulted a[General WebGL Tutorial](https://developer.mozilla.org/en-US/docs/Web/WebGL) found here.

Finally, the skybox images were generated with [Spacescape](http://sourceforge.net/projects/spacescape/).
