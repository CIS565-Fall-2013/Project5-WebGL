-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
There are 2 projects, both based on WebGL and shaded with glsl.

The first one is a shader for a grid that is waving with some kinds of function. The first one is a sin function, the second one is a random wave, the third one is a strange wave using some kinds of function.

The theme of the 2nd project is to real-time render a rotating globe which is illuminated by sunshine. With the height map of the globe given, the globe is shaded so that it looks like
 a globe with mountain scattered on it. Also, I made a simple noise-based water shader to shade the ocean.


-------------------------------------------------------------------------------
PART 1
-------------------------------------------------------------------------------
The first 2 grids are just following the walkthrough. Nothing special, just play with the color.

The 3rd grid follows the rule:

			float s_contrib = sin(position.x*4.0*3.14159 + u_time*4.0);
			float t_contrib = cos(position.y*1.0*3.14159 + u_time*0.5*4.0);
			float height = s_contrib+t_contrib;
			
I don't quite know what it does....

-------------------------------------------------------------------------------
PART 2 
-------------------------------------------------------------------------------
Besides the basic part, I implemented water shader and the height shader. 

For the height shader, I used a rainbow color-ramp to shade the different height. The lower part is more tends to be blue, while the higher part is more tends to be red.
It looks like this:
![Height Map](https://github.com/heguanyu/WebGL-Globe/blob/master/results/height.jpg?raw=true)

Also, I add a noise texture and using it to fulfill the water shader. To implement this, I distort the origin normal according to the color value of the noise map. And to make the ocean floating, 
I move the texture coordination randomly. It is not a procedural water shader, and not that real.

![Water](https://github.com/heguanyu/WebGL-Globe/blob/master/results/water.jpg?raw=true)

For the future work, I would still like to try skybox at the background.

-------------------------------------------------------------------------------
LINK
-------------------------------------------------------------------------------

Part1: http://guanyuhe.com/WebGL-Wave/index.html

Part2: http://guanyuhe.com/WebGL-Globe/index.html

-------------------------------------------------------------------------------
GH-PAGES
-------------------------------------------------------------------------------
I'd tried my best with gh-pages but it have sth wrong when updated. Therefore, I had to put it on the my personal website. It is interesting that when I put it on the website instead of running on local machine,
 the Globe one work on Chrome again!

-------------------------------------------------------------------------------
VIDEO
-------------------------------------------------------------------------------
The project is lived on the link above, so I don't think a video is required.

-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
I got no idea how to test fps for it... And as the there's not a conception as tilesize in cuda, got no idea on what to test for this project. Actually everythign is running in real time.

But one thing that I noticed is that when I open my globe on multiple tabs, the web browser is becoming laggy. Is this a kind of evaluation? 

-------------------------------------------------------------------------------
THIRD PARTY CODE POLICY
-------------------------------------------------------------------------------
None. 

Just to mention, for the rainbow color ramp, I referred to my own code from my bachelor's thesis project.

