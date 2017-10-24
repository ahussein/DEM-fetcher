var gdal = require('gdal')
var Cesium = require('./node_modules/sampleterrain/node_modules/cesium')
var sampleterrain = require("sampleterrain")
var ProgressBar = require('progress');



var filename = process.argv[2]
if (!filename) {
  console.error('Filename must be provided')
  process.exit(1)
}

var outputFile = process.argv[3]


//input image
var ds = gdal.open(filename)
var driver = ds.driver;
var driver_metadata = driver.getMetadata();


if (driver_metadata['DCAP_RASTER'] !== 'YES') {
  console.error('Source file is not a raster')
  process.exit(1)
}


// raster dimensions
var size = ds.rasterSize
console.log('Size is ' + size.x + ', ' + size.y)

console.log('Number of pixels = ' + size.x * size.y)

// geotransform
var geotransform = ds.geoTransform
console.log('Origin = (' + geotransform[0] + ', ' + geotransform[3] + ')')
console.log('Pixel Size = (' + geotransform[1] + ', ' + geotransform[5] + ')')


// bands
var band = ds.bands.get(1)

var x_1
var y_1
var count = 0
var xPointer = false


//output image
var some = gdal.open(outputFile, "w", "GTiff", size.x, size.y, 1, band.dataType)
some.srs = ds.srs
some.geoTransform = ds.geoTransform

var out_band = some.bands.get(1)

var total = size.x * size.y


//reads a block of pixels 
function part(start_x, start_y, end_x, end_y) {
  var matr = []

  for (var i = start_x; i < end_x; i++) {


    for (var j = start_y; j < end_y; j++) {
      count += 1

      x_1 = geotransform[0] + i * geotransform[1];
      y_1 = geotransform[3] + j * geotransform[5];

      matr.push({
        coor: Cesium.Cartographic.fromDegrees(x_1, y_1),
        pixel_coor_x: i,
        pixel_coor_y: j
      })



    }

  }
  if (end_y === size.y) {
    xPointer = true

  }

  return {
    array: matr,
    count: count
  }
}



function update(a, b, c, d) {


  var section = part(a, b, c, d)
  var input = section.array

  //update the height values
  sampleterrain.sample(input, function (err, result) {
    if (err) {
      console.log(err)
    } else {
      

      input.map(function (data) {
        out_band.pixels.set(data.pixel_coor_x, data.pixel_coor_y, Number(data.coor.height.toFixed(5)))
      })

      bar.tick(section.count)

      if (section.count === total) {

        some.close()
        ds.close()

        console.log("done")


      } else {
        b = d
        d += 500
        if (d >= size.y) {
          d = size.y
        }
        if (xPointer) {
          xPointer = false
          a = c
          c += 500
          b = 0
          d = 500
          if (c > size.x) {
            c = size.x
          }
        }


        update(a, b, c, d)
      }
    }

  })


  //progress bar
  var bar = new ProgressBar('  parsing [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 1024,
    total: total
  });

}





update(0, 0, 500, 500)