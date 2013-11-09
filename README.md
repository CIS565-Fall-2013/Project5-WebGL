-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013
-------------------------------------------------------------------------------
Qiong Wang
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
This is a webGL based project for CIS 565 GPU Programming. 
In this project, some beautiful animations were made and can be seen directly from anywhere throught internet. 
There is no need for specific graphics card, and all the following contents were done through general intel graphics card.

In the first part, the simulation is about different kinds of waves. 
The second part is about the rotating globe with some fantastic features such as bumping, moving clouds, rim lighting, etc. 

-------------------------------------------------------------------------------
FEATURES IMPLEMENTED
-------------------------------------------------------------------------------
###**PART 1**

Features:

* A sin-wave based vertex shader:
* A simplex noise based vertex shader:
* One interesting vertex shader: *Aladdin's Magic carpet*

###**PART 2**

Basic Features:
* Bump mapped terrain
* Rim lighting to simulate atmosphere
* Night-time lights on the dark side of the globe
* Specular mapping
* Moving clouds

Optional features:
* Procedural water rendering and animation using noise 
* Orbiting Moon with texture mapping with Bump mapped terrain
* Draw a skybox around the entire scene for the stars (continue debugging)

-------------------------------------------------------------------------------
RESULTS OF PART 1
-------------------------------------------------------------------------------
Please click the images to see the animation :)

**Sin Wave**

[![Sin Wave](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/basic_wave.png)](http://gabriellaqiong.github.io/Project5-WebGL/part1/index.html)


**Simplex Noise**

[![Simplex Noise](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/simplex_wave.png)](http://gabriellaqiong.github.io/Project5-WebGL/part1/index_simplex.html)


**Aladdin's Magic Carpet**

[![Aladdin's carpet](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/magic_carpet.png)](http://gabriellaqiong.github.io/Project5-WebGL/part1/index_custom.html)


-------------------------------------------------------------------------------
RESULTS OF PART 2
-------------------------------------------------------------------------------
**Moon with Bumping**

![moon](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/moon_bump.png)

Please click the image below to see the animation :)

**Virtual Globe with Moon**
[![globe](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/globe_moon_water.png)](http://gabriellaqiong.github.io/Project5-WebGL/part2/index.html)


-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
In the performance evaluation part, I used the JavaScript Performance Monitor library: https://github.com/mrdoob/stats.js

This class provides a simple info box that will help you monitor your code performance.

* **FPS** Frames rendered in the last second. The higher the number the better.
* **MS** Milliseconds needed to render a frame. The lower the number the better.

### Screenshots ###

![stats_js_fps.png](http://mrdoob.github.com/stats.js/assets/stats_js_fps.png)
![stats_js_ms.png](http://mrdoob.github.com/stats.js/assets/stats_js_ms.png)

We need to add the following codes in the javascript.
```javascript
var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

setInterval( function () {

	stats.begin();

	// animation codes

	stats.end();

}, 1000 / 60 );
```

The upper instructions are from Mr. doob's github. After adding the codes of animation as this, we can have

![eval](https://raw.github.com/GabriellaQiong/Project5-WebGL/master/performance_eval.png)

However, the actual framerate is definitely higher than that when using the monitor and the animation with the monitor code is not smooth playing. In the final demo, I removed the evaluation part in the html file.

Instead, I used one [bookmarklet](http://ricardocabello.com/blog/post/707). With the help from this monitor, I can get the following result:

| features                                                              |  approximate fps  |
|:---------------------------------------------------------------------:|:-----------------:|
|    globe with clouds, running water, day night, rim lighting, etc     |       58 ~ 60     |
|    adding general moon                                                |       57 ~ 60     |
|    adding bumped moon                                                 |       57 ~ 60     |
|    simplex wave                                                       |       59 ~ 60     |

They are not quite different from each other in this case.


-------------------------------------------------------------------------------
THIRD PARTY CODE
-------------------------------------------------------------------------------
JavaScript Performance Monitor library: The MIT License, Copyright (c) 2009-2012 Mr.doob

-------------------------------------------------------------------------------
ACKNOWLEDGEMENT
-------------------------------------------------------------------------------
Thanks a lot to Patrick and Liam for the preparation of this project. Thank you :)
