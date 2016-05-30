var Jimp = require('jimp'),
		Lagrange = require('./lagrange'),
		timestamp = require('unix-timestamp'),
		// imageURL from Google StreetView, panoID eZ-muprTwdLqAbBcj8EIGg 
		imageURL = 'test-images/_snow-somewhere.jpg',
		values = ['lighten', 'brighten', 'darken', 'desaturate', 'saturate', 'greyscale', 'hue', 'tint', 'shade', 'xor', 'red', 'green', 'blue'] 

var filters =
{
	/*rina:
	{
		contrast: 0.23
	},
	nadia:
	{
		contrast: 0.53,
		hue: 13,
	},
	nostalgia:
	{
		brightness: 0.1,
		contrast: 0.5,
		saturate: -15,
	},
	sunrise:
	{
		brightness: 0.1,
		contrast: 0.5,
		red: 15
	},
	nashville:
	{
		brightness: 0.05,
		contrast: 0.5,
		red: 38,
		blue: 12,
		green: 33,
		saturate: 3,
		shade: 2

	},

	blackAndWhite:
	{
		brightness: 0.2,
		contrast: 0.65,
		greyscale: 10
	}, */

	backThen:
	{
		brightness: 0.2,
		contrast: 0.65,
		greyscale: 10,
		red: 30,
		green: 25
	}
}

/*filters.ludwig =
{
	brightness: 0.05,
	contrast: 0.25,
	r: 
	[
    [ 0,   0,  10 ],
    [ 1,  30,  45 ],
    [ 2,  82,  98 ],
    [ 3, 130, 135 ],
    [ 4, 255, 250 ]
  ],
  g: 
  [
    [ 0,   0,  10 ],
    [ 1,  48,  55 ],
    [ 2, 115, 128 ],
    [ 3, 160, 170 ],
    [ 4, 255, 250 ]
  ],
  b: 
  [
    [ 0,   0,  10],
    [ 1,  35,  40],
    [ 2, 106, 115],
    [ 3, 181, 185],
    [ 4, 255, 250]
  ]
} 

filters.nineteenSeventySeven =
{
	brightness: 0.05,
	contrast: 0.25,
	r: [
	  [ 0,   0,  75 ],
	  [ 1,  75, 125 ],
	  [ 2, 145, 200 ],
	  [ 3, 190, 220 ],
	  [ 4, 255, 230 ]
	],
	g: [
	  [ 0,   0,  52 ],
	  [ 1,  42,  54 ],
	  [ 2, 110, 120 ],
	  [ 3, 154, 168 ],
	  [ 4, 232, 235 ],
	  [ 5, 255, 242 ]
	],
	b: [
	  [ 0,   0,  62],
	  [ 1,  65,  82],
	  [ 2, 108, 132],
	  [ 3, 175, 210],
	  [ 4, 210, 208],
	  [ 5, 255, 208]
	]
}*/

Jimp.read(imageURL).then(function (image) 
{
	for (var filterName in filters)
	{
		var filter = filters[filterName],
				newImage = image.clone()
		
		console.log(filterName, filter)

		if (filter.brightness) newImage.brightness(filter.brightness)
		if (filter.contrast) newImage.contrast(filter.contrast)
		
		// TODO sepia

		// TODO Instagram filters
		// newImage.filter(filterName)

		var colorArray = getColorArray(filter)
		if (colorArray.length > 0) newImage.color(colorArray)
	
  	newImage.write('test-images/' + generateFileName(filterName))
	}
}).catch(function (err) 
{
  console.error(err)
})

function getColorArray(filter)
{
	var colorArray = []

	values.forEach(function (value)
	{
		// console.log(value + ' > ' + filter[value])
		if (filter[value] != undefined)
		{
			colorArray.push({ apply:value, params:[ filter[value] ] })
		} 
	})

	// console.log(colorArray)
	return colorArray
}

Jimp.prototype.filter = function (filterName, cb) 
{
	if (!filters[filterName]) throw new Error(filterName + 'is not defined')

	var lR  = new Lagrange(0, 0, 1, 1)
  var lG  = new Lagrange(0, 0, 1, 1)
  var lB  = new Lagrange(0, 0, 1, 1)

  lR.addMultiPoints(filters[filterName].r)
  lG.addMultiPoints(filters[filterName].g)
  lB.addMultiPoints(filters[filterName].b)

  /*var pix = this.bitmap.data
  for (var i = 0, n = pix.length; i < n; i += 4){
    pix[i]    = lR.valueOf(pix[i]);
    pix[i+1]  = lB.valueOf(pix[i+1]);
    pix[i+2]  = lG.valueOf(pix[i+2]);
  }*/

  this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) 
  {
    var red = this.bitmap.data[idx]
    var green = this.bitmap.data[idx+1]
    var blue = this.bitmap.data[idx+2]

    red = lR.valueOf(red)
    green = lG.valueOf(green)
    blue = lB.valueOf(blue)

    this.bitmap.data[idx] = (red < 255) ? red : 255
    this.bitmap.data[idx+1] = (green < 255) ? green : 255
    this.bitmap.data[idx+2] = (blue < 255) ? blue : 255
  })

  if (isNodePattern(cb)) return cb.call(this, null, this)
  else return this
}

function generateFileName(text)
{
	timestamp.round = true
	return timestamp.now() + '-' + text + '.jpg'
}

function isNodePattern(cb) 
{
  if ("undefined" == typeof cb) return false;
  if ("function" != typeof cb)
    throw new Error("Callback must be a function");
  return true;
}