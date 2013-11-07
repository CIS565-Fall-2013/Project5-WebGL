-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013


---
Part 1: Vertex Shader Shenanigans
---

Some screenshots to begin!

click the image to open a demo

[![screen](images/wave.png)](http://ishaan13.github.io/Project5-WebGL/part1/vert_wave.html)

[![screen](images/simplex_2d.png)](http://ishaan13.github.io/Project5-WebGL/part1/vert_wave_simplex.html)

[![screen](height_1.PNG)](http://ishaan13.github.io/Project5-WebGL/part1/vert_wave_height.html)

[![screen](height_2.PNG)](http://ishaan13.github.io/Project5-WebGL/part1/vert_wave_height.html)


Details:
* The simple wave is just a sin wave that goes up and down based on the x and z coordinage
* The simplex noise function is used in 2D to generate a moving height field sort of effect.
* The last one is an infinitely tiled, pseudo random terrain generation

For the pseudo-random infinitely tiled terrain generation, I used a combination of a tiled noise texture along with the simplex noise function to create a time-dependent but yet infinitely tiled terrain which is false colored for visualization.

---
Part 2: Globe Rendering
---

Click to load demo

[![screen](images/explain.png)](http://ishaan13.github.io/Project5-WebGL/part2/frag_globe.html)

Extra Features:
* Perlin Noise function based dynamic random clouds (clouds go in and out)
* Ray Traced cloud shadows (including the procedural clouds)
 
Required Features:
* Day Textures
* Specular Maps
* Night Textures
* Cloud Textures
* Cloud Transparencies
* Bump Mapping
