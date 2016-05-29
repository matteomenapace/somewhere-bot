var config = require('./config'),
    translator = require('yandex-translate-api')(config.yandexKey),
    countryLookup = require('country-data').lookup,
    randomLatitude = require('random-latitude'),
    randomLongitude = require('random-longitude'),
    getPanoramaByLocation = require('google-panorama-by-location'),
    getPanoramaByID = require('google-panorama-by-id'),
    getPanoramaURL = require('google-panorama-url'),
    getPanoramaTiles = require('google-panorama-tiles'),
    locationAttempts = 0, // to count how many random locations we have tried before finding one that has a StreetView,
    greetings, hashtag, tweetText // strings 

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
            // console.log(result)
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
    var url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panorama.id + '&output=tile&x=' + config.x + '&y=' + config.y + '&zoom=' + config.zoom + '&nbt&fover=2';   

    console.log(url)

    getPanoramaByID(panorama.id, function (err, result) 
    {
        if (err) throw err
        else 
        {
            console.log(result.Location)
            greetings = 'Greetings from ' + result.Location.region,
            hashtag = getHashtag(result.Location.country)
            console.log(greetings)
            translateIntoCountryLanguage(greetings, result.Location.country)
        }    
    })
}

function translateIntoCountryLanguage(text, countryName)
{
    var country = countryLookup.countries({name: countryName})[0]
    console.log(country)
    var options = country ? {to: country.languages[0]} : {to: countryName.toLowerCase().substring(0, 3)} 
    // if the country can't be found, pick the first 3 letters from its name
    
    translator.translate(text, options, function(err, res) 
    {
        if (err) 
        {
            console.error(err)
            tweetText = greetings + hashtag
        }    
        else
        {
           console.log(res)
           tweetText = res.text[0] + hashtag  
        }
        console.log('TWEET > ' + tweetText)
    })
}

function getHashtag(string)
{
    return ' #' + string.replace(/\s/g, '') // no spaces in hashtags
}