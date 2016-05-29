var randomLatitude = require('random-latitude'),
    randomLongitude = require('random-longitude'),
    getPanoramaByLocation = require('google-panorama-by-location'),
    getPanoramaByID = require('google-panorama-by-id'),
    getPanoramaURL = require('google-panorama-url'),
    getPanoramaTiles = require('google-panorama-tiles'),
    zoom = 4, // the zoom level for Google StreetView (1-5)
    x = 6, // with zoom=4 there are 12 columns, x=6 gives you the "back of the Google Car" view
    y = 3, // with zoom=4 there are 6 rows, y=3 gives you a good balance (not too much sky, not too much road)
    locationAttempts = 0 // to count how many random locations we have tried before finding one that has a StreetView

function getRandomLocation()
{
    var location = [ randomLatitude(), randomLongitude() ]
    return location
}

// let's define a recursive function 
// which will call itself until it finds a location with StreetView
function tryAndGetRandomStreetView(location)
{
    getPanoramaByLocation(location, function (err, result) 
    {
        if (err) 
        {
            console.error(err)
            locationAttempts ++ // increment the attempts count
            // and try again..
            tryAndGetRandomStreetView(getRandomLocation())
        }    
        else 
        {
            console.log('It took ' + locationAttempts + ' attempts to found one!')
            console.log(result)
            getPanoramaInfo(result)
            // getPanoramaImages(result)
        }
    })   
}
// ...and make it start
tryAndGetRandomStreetView(getRandomLocation())

function getPanoramaImages(panorama)
{
    var id = panorama.id
        
    var tiles = getPanoramaTiles(zoom, panorama.tiles)
    // console.log(tiles)

    var images = {}
    for (var y = 0; y < tiles.rows; y++) 
    {
        for (var x = 0; x < tiles.columns; x++) 
        {
            var key = x + '-' + y
            images[key] = 
            {
                url: getPanoramaURL(id, { x: x, y: y, zoom: zoom }),
                position: [ x * tiles.tileWidth, y * tiles.tileHeight ]
            }
        }
    }
    
    console.log(images)
    return images
}

function getPanoramaInfo(panorama)
{
    var url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panorama.id + '&output=tile&x=' + x + '&y=' + y + '&zoom=4&nbt&fover=2';   

    console.log(url)

    getPanoramaByID(panorama.id, function (err, result) 
    {
        if (err) throw err
        else 
        {
            console.log(result.Location)
            console.log('Greetings from ' + result.Location.region)  
        }    
    })
}

