-------------------------------------------------------------------------------
Terrain Morphing Plus ISS Orbit Visualizer
--------------------------------------------------------------------------------
![Pair of screenshots](screenshots/big_screenshot.png)
* DISCLAIMER 1: Right now this project is ONLY compatible with Firefox! Fixes for Chrome coming soon!
* DISCLAIMER 2: You might have to wait a little bit for texture data to load, since the globe and terrain renderers use high-res textures!

-------------------------------------------------------------------------------
Terrain Morphing
-------------------------------------------------------------------------------
The first part of this project is a WebGL terrain renderer. [Click here to see it.](http://nmarshak1337.github.io/Project5-WebGL/part1/terrain_render.html). [Click here to see a video](http://youtu.be/2DtJ2FN_TD8).

* The terrain renderer uses height field (DEM) data from NASA ASTER (Mt. Fuji) and the USGS (Mt. Rainier). 
* I used a [forum post by TrickyVein](http://forums.nexusmods.com/index.php?/topic/517230-tutorial-converting-a-dem-to-a-heightmap/) to convert DEM data to a heightmap. I also wrote [my own tutorial](http://lightspeedbanana.blogspot.com/2013/11/getting-nasa-height-field-data.html) on how to get data from the USGS.
* I perform morphing in the vertex shader by reading two height fields as textures, blending, then using the blended result to perturb the vertices:
```glsl
    float height1 = texture2D(u_Height, texCoord).r; 
    float height2 = texture2D(u_Height2, texCoord).r; 
    float height = mix(height1, height2, u_heightBlend); 
    gl_Position = u_modelViewPerspective * vec4(vec3(position, 0.5*height), 1.0);
    curr_color = mix(low_color, high_color, height); 
```
