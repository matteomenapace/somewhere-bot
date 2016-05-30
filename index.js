var config = require('./config'),
    translator = require('yandex-translate-api')(config.yandexKey),
    countryLookup = require('country-data').lookup,
    randomLatitude = require('random-latitude'),
    randomLongitude = require('random-longitude'),
    getPanoramaByLocation = require('google-panorama-by-location'),
    getPanoramaByID = require('google-panorama-by-id'),
    getPanoramaURL = require('google-panorama-url'),
    getPanoramaTiles = require('google-panorama-tiles'),
    Twitter = require('twitter'),
    twitterBot = new Twitter(config.twitterKeys),
    Jimp = require('jimp'),
    filters = require('./filters'),
    chosenFilter = 'twoDaysAgo',
    values = ['lighten', 'brighten', 'darken', 'desaturate', 'saturate', 'greyscale', 'hue', 'tint', 'shade', 'xor', 'red', 'green', 'blue'], 
    locationAttempts = 0, // to count how many random locations we have tried before finding one that has a StreetView,
    imageID = null,
    tweetText = null,
    greetings, hashtag  // strings 

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
      console.error('├ ' + err)
      locationAttempts ++ // increment the attempts count
      // and try again..
      tryAndGetRandomStreetView(getRandomLocation())
    }    
    else 
    {
      console.log('├ It took ' + locationAttempts + ' attempts to found one!')
      // console.log(result)
      getPanoramaInfo(result)
      processPanoramaImage(result)
      // getPanoramaImages(result)
    }
  })   
}
// ...and make it start
console.log('├ Searching for a street view...')
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
  getPanoramaByID(panorama.id, function (err, result) 
  {
    if (err) throw err
    else 
    {
      console.log(result.Location)
      
      var place = result.Location.region.split(',')[0]
          
      greetings = 'Greetings from ' + place
      // console.log(greetings)
      
      hashtag = getHashtag(result.Location.country)

      if (config.translateCaption) translateIntoCountryLanguage(greetings, result.Location.country)
      else makeTweet(greetings + hashtag)  
    }    
  })
}

function translateIntoCountryLanguage(text, countryName)
{
  var country = countryLookup.countries({name: countryName})[0]
  // console.log(country)
  var options = country ? {to: country.languages[0]} : {to: countryName.toLowerCase().substring(0, 3)} 
  // if the country can't be found, pick the first 3 letters from its name
  
  translator.translate(text, options, function(err, res) 
  {
    if (err) 
    {
      console.error('├ ' + err)
      makeTweet(greetings + hashtag)
    }    
    else
    {
      console.log(res)
      makeTweet(res.text[0] + hashtag)  
    }
  })
}

function getHashtag(string)
{
  return ' #' + string.replace(/\s/g, '') // no spaces in hashtags
}

function processPanoramaImage(panorama)
{
  var url = 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panorama.id + '&output=tile&x=' + config.x + '&y=' + config.y + '&zoom=' + config.zoom + '&nbt&fover=2'
  console.log(url)

  Jimp.read(url).then(function (image) 
  {
    var filter = filters[chosenFilter],
        newImage = image.clone()
    
    // console.log(chosenFilter, filter)

    if (filter.brightness) newImage.brightness(filter.brightness)
    if (filter.contrast) newImage.contrast(filter.contrast)

    var colorArray = getColorArray(filter)
    if (colorArray.length > 0) newImage.color(colorArray)

    tweetImage(newImage)

    /*
      image.write( 'test-images/' + generateFileName( [panorama.id] ) )

      for (var filterName in filters)
      {
        var filter = filters[filterName],
            newImage = image.clone()
        
        console.log(filterName, filter)

        if (filter.brightness) newImage.brightness(filter.brightness)
        if (filter.contrast) newImage.contrast(filter.contrast)

        var colorArray = getColorArray(filter)
        if (colorArray.length > 0) newImage.color(colorArray)
      
        newImage.write( 'test-images/' + generateFileName( [panorama.id, filterName] ) )
      }
    */
  }).catch(function (err) 
  {
    console.error(err)
  }) 
}

function generateFileName(chunks)
{
  return chunks.join('-') + '.jpg'
}

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

function tweetImage(image)
{
  /*image.getBuffer( Jimp.MIME_JPEG, function(buffer)
  {
    // is buffer the actual thing passed in here?
  })*/

  twitterBot.post('media/upload', {media: image.bitmap.data}, function(error, media, response) 
  {
    if (error)
    {
      console.error(error)
    }
    else  
    {
      console.log(media)

      imageID = media.media_id_string

      makeTweet()
    }
  })
}

function makeTweet(text) 
{
  if (text) tweetText = text

  if (!imageID) 
  {
    console.log('├ Image not ready yet') 
    return
  }  
  if (!tweetText)
  {
    console.log('├ Tweet text not ready yet') 
    return
  }    

  console.log('├ TWEET > ' + tweetText)   

  if (config.testMode) 
  {
    console.log('├ In test mode, exiting...')
    return
  }  

  var status = 
  {
    status: tweetText,
    media_ids: imageID // Pass the media id string
  }

  twitterBot.post('statuses/update', status,  function(error, tweet, response)
  {
    if (error) console.error(error)
    else
    {
      console.log('├ DONE! ' + tweet.text) 
      // console.log(response)
    } 
  })
}