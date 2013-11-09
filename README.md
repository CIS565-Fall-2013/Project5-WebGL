-------------------------------------------------------------------------------
#CIS565: Project 5: WebGL
-------------------------------------------------------------------------------
# Part 1:  
Part 1 implements three types of vertex shader:
 ## Sine-wave:  
![sine/cosine wave](resources/snapshot01.png)  
 ## Simplex noise:  
![simplex noise](resources/snapshot02.png)  
 ## Perlin noise:  
![Pelin noise heightfield](resources/snapshot03.png)  
 This WebGL implementation of Perlin noise is based on [Perlin's IMPROVED noise algorithm](http://mrl.nyu.edu/~perlin/noise/) and 
 the corresponding [Direct3D Effects implementation](http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter26.html).  
 Because the permutation and gradient tables are stored as textures, filtering should be turned off on these textures:  
 
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST );  
		context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST );

 
# Part 2:  
 Part 2 renders an Earth globe with the following effects:  
 * Day/night lighting
 * Moving clouds
 * Bump-mapped terrain
 * Rim-light factor
 * Cloud shadow  
 
 ![Earth Global](resources/snapshot04.png)  
 
 To create cloud shadow effect, the following steps are taken:  
 * Transform light rays to the lit point's tangent space.
 * Calcuate the offset of texture coordinates on the lit point based on the light rays and the height of cloud.
 * If the cloud density at the location of offsetted texture coordinates is not zero, then the lit point should be shadowed by the cloud. 
 
# Performance evaluation:
 * Test with maximum texture size:  
 The maximum texture size on my Firefox browser is 8192. So I tried some daytime/nightime earth maps with 8192x4096 resolution:  
 
 ![HiRes Earth](resources/snapshot05.png)  
 
 The size of a 8192x4096 PNG file is 26 MB (3 MB for a JPG), and the page loading time is a bit too long ( OVER 5 sec. ) even running locally.  
 Compared to loading the whole images once, a Level-of-detail approach like that of Google Map is more feasible.  