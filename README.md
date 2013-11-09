-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013




-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
This project has been divided into two parts: 

In the first part of this project,a GLSL vertex shader is implemented as 
part of a WebGL demo. A dynamic wave animation is created using code that 
runs entirely on the GPU.

In the second part of this project,a GLSL fragment shader is created
to render an interactive globe in WebGL. This includes texture blending,
bump mapping, specular masking, and adding a cloud layer to give our globe a 
uniquie feel.



In Part 1, the following are implemented:

* A sin-wave based vertex shader:
* A simplex noise based vertex shader:
* One interesting vertex shader - A standing wave has been implemented 



In Part 2, the following are implemented:

* Bump mapped terrain
* Rim lighting to simulate atmosphere
* Night-time lights on the dark side of the globe
* Specular mapping
* Moving clouds

The following one open-ended effect is implemented:

* Shade based on altitude using the height map
* Also keyboard interativity and a timer has been added. Press "B" key to see shade based on altitude


-------------------------------------------------------------------------------
VIDEO
-------------------------------------------------------------------------------
[Globe Video](http://www.youtube.com/watch?v=Ov8-RNNjRc0)


-------------------------------------------------------------------------------
RENDERS
-------------------------------------------------------------------------------
Standing Wave 
![alt tag](https://raw.github.com/vivreddy/Project5-WebGL/master/renders/swave.png)

Globe
![alt tag](https://raw.github.com/vivreddy/Project5-WebGL/master/renders/globe1.png)

Globe with Shading according to Altitude 
![alt tag](https://raw.github.com/vivreddy/Project5-WebGL/master/renders/globe2.png)



-------------------------------------------------------------------------------
GH-PAGES
-------------------------------------------------------------------------------
Since this assignment is in WebGL you will make your project easily viewable by 
taking advantage of GitHub's project pages feature.

Once you are done you will need to create a new branch named gh-pages:

`git branch gh-pages`

Switch to your new branch:

`git checkout gh-pages`

Create an index.html file that is either your renamed frag_globe.html or 
contains a link to it, commit, and then push as usual. Now you can go to 

`<user_name>.github.io/<project_name>` 

to see your beautiful globe from anywhere.



-------------------------------------------------------------------------------
PERFORMANCE EVALUATION
-------------------------------------------------------------------------------
The performance evaluation for WebGL was done by including a timer in the animate 
function of the Java script and the difference was noted for just diffuse rendering 
and rendering with bump, specular and clouds. 

Diffuse rendering       - Elapsed Time - 0.4970 
With Complete rendering - Elapsed Time - 0.5010




---
SUBMISSION
---
As with the previous project, you should fork this project and work inside of
your fork. Upon completion, commit your finished project back to your fork, and
make a pull request to the master repository.  You should include a README.md
file in the root directory detailing the following

* A brief description of the project and specific features you implemented
* At least one screenshot of your project running.
* A link to a video of your project running.
* Instructions for building and running your project if they differ from the
  base code.
* A performance writeup as detailed above.
* A list of all third-party code used.
* This Readme file edited as described above in the README section.
