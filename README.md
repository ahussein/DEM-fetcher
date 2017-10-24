
## **STK-fetcher**
 A Node.js tool to replace height value of each pixel in an input raster DEM with a value that is interpolated -sampled- from Cesium Default terrain provider "STK-World".
You can use the resulted DEM as a source for your buildings elevation before creating the 3d models, for example:

[ArcGIS: Derive heights from a raster](http://desktop.arcgis.com/en/arcmap/latest/extensions/3d-analyst/converting-2d-features-to-3d-features-deriving-the-existing-features-heights-from-a-surface.htm) which is the pre-step to create a 3D Model.

After exporting your 3D model into gltf and visualize it in Cesium, your model sould be clamped on Cesium terrain "STK-Terrain". 
## Installation
1. Clone the repository
2. run `npm install`

## Usage
To use it run `node index.js <input-image-path> <output-image-path>`
e.g `node index.js ./images/test.tif  ./images/result.tif`

## Requirments
1. Node.js installed
2. Currently, the input raster must be [Geotiff](http://www.gdal.org/frmt_gtiff.html), and the spatial refernce WGS84.

## Credits
The tool uses a modified version of [sampleterrain](https://github.com/jimmyangel/sampleterrain)
