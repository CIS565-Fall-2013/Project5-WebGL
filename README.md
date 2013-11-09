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
The performance evaluation is where you will investigate how to make your 
program more efficient using the skills you've learned in class. You must have
performed at least one experiment on your code to investigate the positive or
negative effects on performance. 

We encourage you to get creative with your tweaks. Consider places in your code
that could be considered bottlenecks and try to improve them. 

Each student should provide no more than a one page summary of their
optimizations along with tables and or graphs to visually explain any
performance differences.