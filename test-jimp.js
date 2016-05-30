var Jimp = require('jimp'),
		timestamp = require('unix-timestamp'),
		imageURL = 'test-images/brazil.jpg', // originally from Google StreetView, panoID eZ-muprTwdLqAbBcj8EIGg 
		filters =
		{
			rina:
			{
				brightness: 0,
				contrast: 0.23,
				darken: 0,
				hue: 0,
				desaturate: 0
			},
			nadia:
			{
				brightness: 0,
				contrast: 0.53,
				darken: 0,
				hue: 13,
				desaturate: 0
			},
			nostalgia:
			{
				brightness: 0.1,
				contrast: 0.5,
				darken: 0,
				hue: 0,
				desaturate: 15,
				red: 0
			},
			sunrise:
			{
				brightness: 0.15,
				contrast: 0.5,
				darken: 0,
				hue: 0,
				desaturate: 0,
				saturate: 0,
				red: 15
			},
			nashville:
			{
				brightness: 0.05,
				contrast: 0.2,
				darken: 0,
				hue: 0,
				desaturate: 0,
				saturate: 0,
				red: 24,
				blue: 15
			}
		},
		chosenFilter = 'nashville'

Jimp.read(imageURL).then(function (image) 
{
  image.brightness( filters[chosenFilter].brightness )
  		 .contrast( filters[chosenFilter].contrast )
  		 .color([ 
  		 	{ apply: 'hue', params: [ filters[chosenFilter].hue ] },
    		{ apply: 'darken', params: [ filters[chosenFilter].darken ] },
    		{ apply: 'desaturate', params: [ filters[chosenFilter].desaturate ] },
    		{ apply: 'saturate', params: [ filters[chosenFilter].saturate ] },
    		{ apply: 'red', params: [ filters[chosenFilter].red ] },
    		{ apply: 'blue', params: [ filters[chosenFilter].blue ] }
				])

  image.write('test-images/' + generateFileName())
}).catch(function (err) 
{
  console.error(err)
})

function generateFileName()
{
	timestamp.round = true
	return timestamp.now() + '.jpg'
}