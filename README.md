-------------------------------------------------------------------------------
CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
Fall 2013
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
NOTE:
-------------------------------------------------------------------------------
This project requires any graphics card with support for a modern OpenGL 
pipeline. Any AMD, NVIDIA, or Intel card from the past few years should work 
fine, and every machine in the SIG Lab and Moore 100 is capable of running 
this project.

This project also requires a WebGL capable browser. The project is known to 
have issues with Chrome on windows, but Firefox seems to run it fine.

-------------------------------------------------------------------------------
INTRODUCTION:
-------------------------------------------------------------------------------
In this project, I have implemented vertex and fragment shaders in WebGL.
There are two parts to this project:
Part1: Deforms a simple grid of points using vertex shaders
Part2: Renders a globe with fragment shaders

-------------------------------------------------------------------------------
CONTENTS:
-------------------------------------------------------------------------------
The Project4 root directory contains the following subdirectories:
	
* part1/ contains the base code for the Wave Vertex Shader.
* part2/ contains the base code for the Globe Fragment Shader.
* resources/ contains the screenshots found in this readme file.

-------------------------------------------------------------------------------
PART 1 REQUIREMENTS:
-------------------------------------------------------------------------------

To view the WebGL demo for any of the following, please click the image,


* A sin-wave based vertex shader:

```glsl
float s_contrib = sin(position.x*2.0*3.14159 + u_time);
float t_contrib = cos(position.y*2.0*3.14159 + u_time);
float height = s_contrib*t_contrib;
```

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/sinWaveGrid.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave.html)

* A simplex noise based vertex shader:

```glsl
vec2 simplexVec = vec2(u_time, position);
float s_contrib = snoise(simplexVec);
float t_contrib = snoise(vec2(s_contrib,u_time));
```
[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/oceanWave.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_simplex.html)


* Custom vertex shader
I tried implementing a ripple-like effect with sin waves radially moving outwards from a point.

```glsl
float radius = sqrt( (position.x-xorigin)*(position.x-xorigin) + (position.y-yorigin)*(position.y-yorigin));
height = 0.5/u_time*sin(freq*radius - u_time);
```
I referred http://www.gamasutra.com/view/feature/131530/refractive_texture_mapping_part_.php?page=3 for the math.

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/ripple.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_custom.html)

[![ScreenShot](https://raw.github.com/vimanyu/Project5-WebGL/master/resources/ripple_textured.png)](http://vimanyu.github.io/Project5-WebGL/vert_wave_custom_textured.html)


-------------------------------------------------------------------------------
PART 1 WALKTHROUGH:
-------------------------------------------------------------------------------
**Sin Wave**

* For this assignment, you will need the latest version of Firefox.
* Begin by opening index.html. You should see a flat grid of black and white 
  lines on the xy plane:

![Example boring grid](resources/emptyGrid.png)

* In this assignment, you will animate the grid in a wave-like pattern using a 
  vertex shader, and determine each vertex’s color based on its height, as seen 
  in the example in the requirements.
* The vertex and fragment shader are located in script tags in `index.html`.
* The JavaScript code that needs to be modified is located in `index.js`.
* Required shader code modifications:
	* Add a float uniform named u_time.
	* Modify the vertex’s height using the following code:

	```glsl
	float s_contrib = sin(position.x*2.0*3.14159 + u_time);
	float t_contrib = cos(position.y*2.0*3.14159 + u_time);
	float height = s_contrib*t_contrib;
	```

	* Use the GLSL mix function to blend together two colors of your choice based 
	  on the vertex’s height. The lowest possible height should be assigned one 
	  color (for example, `vec3(1.0, 0.2, 0.0)`) and the maximum height should be 
	  another (`vec3(0.0, 0.8, 1.0)`). Use a varying variable to pass the color to 
	  the fragment shader, where you will assign it `gl_FragColor`.

* Required JavaScript code modifications:
	* A floating-point time value should be increased every animation step. 
	  Hint: the delta should be less than one.
	* To pass the time to the vertex shader as a uniform, first query the location 
	  of `u_time` using `context.getUniformLocation` in `initializeShader()`. 
	  Then, the uniform’s value can be set by calling `context.uniform1f` in 
	  `animate()`.

**Simplex Wave**

* Now that you have the sin wave working, create a new copy of `index.html`. 
  Call it `index_simplex.html`, or something similar.
* Open up `simplex.vert`, which contains a compact GLSL simplex noise 
  implementation, in a text editor. Copy and paste the functions included 
  inside into your `index_simplex.html`'s vertex shader.
* Try changing s_contrib and t_contrib to use simplex noise instead of sin/cos 
  functions with the following code:

```glsl
vec2 simplexVec = vec2(u_time, position);
float s_contrib = snoise(simplexVec);
float t_contrib = snoise(vec2(s_contrib,u_time));
```

**Wave Of Your Choice**

* Create another copy of `index.html`. Call it `index_custom.html`, or 
  something similar.
* Implement your own interesting vertex shader! In your README.md with your 
  submission, describe your custom vertex shader, what it does, and how it 
  works.

-------------------------------------------------------------------------------
PART 2 REQUIREMENTS:
-------------------------------------------------------------------------------
In Part 2, you are given code for:

* Reading and loading textures
* Rendering a sphere with textures mapped on
* Basic passthrough fragment and vertex shaders 
* A basic globe with Earth terrain color mapping
* Gamma correcting textures
* javascript to interact with the mouse
  * left-click and drag moves the camera around
  * right-click and drag moves the camera in and out

You are required to implement:

* Bump mapped terrain
* Rim lighting to simulate atmosphere
* Night-time lights on the dark side of the globe
* Specular mapping
* Moving clouds

You are also required to pick one open-ended effect to implement:

* Procedural water rendering and animation using noise 
* Shade based on altitude using the height map
* Cloud shadows via ray-tracing through the cloud map in the fragment shader
* Orbiting Moon with texture mapping and shadow casting onto Earth
* Draw a skybox around the entire scene for the stars.
* Your choice! Email Liam and Patrick to get approval first

Finally in addition to your readme, you must also set up a gh-pages branch 
(explained below) to expose your beautiful WebGL globe to the world.

Some examples of what your completed globe renderer will look like:

![Completed globe, day side](resources/globe_day.png)

Figure 0. Completed globe renderer, daylight side.

![Completed globe, twilight](resources/globe_twilight.png)

Figure 1. Completed globe renderer, twilight border.

![Completed globe, night side](resources/globe_night.png)

Figure 2. Completed globe renderer, night side.

-------------------------------------------------------------------------------
PART 2 WALKTHROUGH:
-------------------------------------------------------------------------------

Open part2/frag_globe.html in Firefox to run it. You’ll see a globe 
with Phong lighting like the one in Figure 3. All changes you need to make 
will be in the fragment shader portion of this file.

![Initial globe](resources/globe_initial.png)

Figure 3. Initial globe with diffuse and specular lighting.

**Night Lights**

The backside of the globe not facing the sun is completely black in the 
initial globe. Use the `diffuse` lighting component to detect if a fragment 
is on this side of the globe, and, if so, shade it with the color from the 
night light texture, `u_Night`. Do not abruptly switch from day to night; 
instead use the `GLSL mix` function to smoothly transition from day to night 
over a reasonable period. The resulting globe will look like Figure 4. 
Consider brightening the night lights by multiplying the value by two. 

The base code shows an example of how to gamma correct the nighttime texture:

```glsl
float gammaCorrect = 1/1.2;
vec4 nightColor = pow(texture2D(u_Night, v_Texcoord), vec4(gammaCorrect));
```

Feel free to play with gamma correcting the night and day textures if you 
wish. Find values that you think look nice!

![Day/Night without specular mapping](resources/globe_nospecmap.png)

Figure 4. Globe with night lights and day/night blending at dusk/dawn.

**Specular Map** 

Our day/night color still shows specular highlights on landmasses, which 
should only be diffuse lit. Only the ocean should receive specular highlights. 
Use `u_EarthSpec` to determine if a fragment is on ocean or land, and only 
include the specular component if it is in ocean.

![Day/Night with specular mapping](resources/globe_specmap.png)

Figure 5. Globe with specular map. Compare to Figure 4. Here, the specular 
component is not used when shading the land.

**Clouds**

In day time, clouds should be diffuse lit. Use `u_Cloud` to determine the 
cloud color, and `u_CloudTrans` and `mix` to determine how much a daytime 
fragment is affected by the day diffuse map or cloud color. See Figure 6.

In night time, clouds should obscure city lights. Use `u_CloudTrans` and `mix` 
to blend between the city lights and solid black. See Figure 7.

Animate the clouds by offseting the `s` component of `v_Texcoord` by `u_time` 
when reading `u_Cloud` and `u_CloudTrans`.

![Day with clouds](resources/globe_daycloud.png)

Figure 6. Clouds with day time shading.

![Night with clouds](resources/globe_nightcloud.png)

Figure 7. Clouds observing city nights on the dark side of the globe.

**Bump Mapping**

Add the appearance of mountains by perturbing the normal used for diffuse 
lighting the ground (not the clouds) by using the bump map texture, `u_Bump`. 
This texture is 1024x512, and is zero when the fragment is at sea-level, and 
one when the fragment is on the highest mountain. Read three texels from this 
texture: once using `v_Texcoord`; once one texel to the right; and once one 
texel above. Create a perturbed normal in tangent space:

`normalize(vec3(center - right, center - top, 0.2))`

Use `eastNorthUpToEyeCoordinates` to transform this normal to eye coordinates, 
normalize it, then use it for diffuse lighting the ground instead of the 
original normal.

![Globe with bump mapping](resources/globe_bumpmap.png)

Figure 8. Bump mapping brings attention to mountains.

**Rim Lighting**

Rim lighting is a simple post-processed lighting effect we can apply to make 
the globe look as if it has an atmospheric layer catching light from the sun. 
Implementing rim lighting is simple; we being by finding the dot product of 
`v_Normal` and `v_Position`, and add 1 to the dot product. We call this value 
our rim factor. If the rim factor is greater than 0, then we add a blue color 
based on the rim factor to the current fragment color. You might use a color 
something like `vec4(rim/4, rim/2, rim/2, 1)`. If our rim factor is not greater 
than 0, then we leave the fragment color as is. Figures 0,1 and 2 show our 
finished globe with rim lighting.

For more information on rim lighting, 
read http://www.fundza.com/rman_shaders/surface/fake_rim/fake_rim1.html.

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
The performance evaluation is where you will investigate how to make your 
program more efficient using the skills you've learned in class. You must have
performed at least one experiment on your code to investigate the positive or
negative effects on performance. 

We encourage you to get creative with your tweaks. Consider places in your code
that could be considered bottlenecks and try to improve them. 

Each student should provide no more than a one page summary of their
optimizations along with tables and or graphs to visually explain any
performance differences.

-------------------------------------------------------------------------------
THIRD PARTY CODE POLICY
-------------------------------------------------------------------------------
* Use of any third-party code must be approved by asking on the Google groups.  
  If it is approved, all students are welcome to use it.  Generally, we approve 
  use of third-party code that is not a core part of the project.  For example, 
  for the ray tracer, we would approve using a third-party library for loading 
  models, but would not approve copying and pasting a CUDA function for doing 
  refraction.
* Third-party code must be credited in README.md.
* Using third-party code without its approval, including using another 
  student's code, is an academic integrity violation, and will result in you 
  receiving an F for the semester.

-------------------------------------------------------------------------------
SELF-GRADING
-------------------------------------------------------------------------------
* On the submission date, email your grade, on a scale of 0 to 100, to Liam, 
  liamboone@gmail.com, with a one paragraph explanation.  Be concise and 
  realistic.  Recall that we reserve 30 points as a sanity check to adjust your 
  grade.  Your actual grade will be (0.7 * your grade) + (0.3 * our grade).  We 
  hope to only use this in extreme cases when your grade does not realistically 
  reflect your work - it is either too high or too low.  In most cases, we plan 
  to give you the exact grade you suggest.
* Projects are not weighted evenly, e.g., Project 0 doesn't count as much as 
  the path tracer.  We will determine the weighting at the end of the semester 
  based on the size of each project.


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
