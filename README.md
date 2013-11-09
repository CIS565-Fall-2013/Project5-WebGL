-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013

-------------------------------------------------------------------------------
PART 1
-------------------------------------------------------------------------------
**Sine Wave**

![alt text](./part1/sineWave.png "sine")

**Simplex Wave**

![alt text](./part1/simplexWave.png "sine")

**Sin/cos wave using concentric circles**

For this wave, I offset the vertices using sin/cos functions based on how fart
the vertex is from the center of the grid. The points furthest away have the most
displacement.

![alt text](./part1/waterWave.png "sin/cos")

-------------------------------------------------------------------------------
PART 2
-------------------------------------------------------------------------------

**Globe with procedurally animated water**

![alt text](./part2/globe.png "globe")

**Elevation map with bump mapping**

Press the 1 key to see the elevation map render.

![alt text](./part2/elevation.png "elevation map")

[Here](https://vimeo.com/78964561) is a video of the wave and the globe running 
on Firefox.

You can see the globe [here] (http://zxyzhu.github.io/Project5-WebGL/)

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
I used stats.js from https://github.com/mrdoob/stats.js/ to benchmark my WebGL 
application. Both the wave and globe ran at 60 fps. 
The elevation map ran slightly faster than the full render since there is no
specular calculation and no cloud animations. 
For the wave, performace stayed steady at 60fps for small and medium sized grids. 
Performance dropped to to about 55 fps when the grid is 1024*1024, and to 45 fps 
at a grid size of 2048*2048. 