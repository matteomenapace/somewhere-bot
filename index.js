var config = require('./config'),
    copyWriter = require('./CopyWriter'),
    emojiConverter = require('./EmojiConverter'),
    translator = require('yandex-translate-api')(config.yandexKey),
    countryLookup = require('country-data').lookup,
    randomLatitude = require('random-latitude'),
    randomLongitude = require('random-longitude'),
    // Random = require('random-js'),
    // random = new Random(Random.engines.mt19937().autoSeed()),
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
    latitude = null,
    longitude = null,
    country = null,
    place = null,
    emoji = null,
    greetings, hashtag

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
      console.log('├ It took ' + locationAttempts + ' attempts to find one!')
      console.log(result)
      latitude = result.latitude
      longitude = result.longitude   
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

      country = result.Location.country
      place = result.Location.region.split(',')[0]

      greetings = copyWriter.generate({place: place}) 
      console.log(greetings)

      hashtag = getHashtag(country)

      emoji = emojiConverter.getEmoji(country)

      tweetText = greetings
      if (emoji) tweetText += ' ' + emoji.render()
      else  tweetText += hashtag  
      makeTweet()  

      /*
      if (config.translateGreetings) translateIntoCountryLanguage(greetings, country)
      else makeTweet(greetings + hashtag)
      */  
    }
  })
}

function translateIntoCountryLanguage(string, countryName)
{
  var country = countryLookup.countries({name: countryName})[0],
      language = country ? country.languages[0] : countryName.toLowerCase().substring(0, 3), // if the country can't be found, pick the first 3 letters from its name
      options = {to: language} 

  if (language == 'eng') // no need to translate from English...
  {
    makeTweet(greetings + hashtag)
    return
  }  

  console.log('├ translateIntoCountryLanguage > ' + string + ' > ' + language)

  translator.translate(string, options, function(err, res) 
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
  image.getBuffer( Jimp.MIME_JPEG, function(error, buffer)
  {
    console.log(buffer)

    twitterBot.post('media/upload', {media:buffer}, function(error, media, response) 
    {
      if (error)
      {
        console.error('media/upload fail...')
        console.error(error)
      }
      else  
      {
        console.log(media)
        imageID = media.media_id_string
        makeTweet()
      }
    })
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
    lat: latitude,
    lon: longitude,
    display_coordinates: true,
    status: tweetText,
    media_ids: imageID
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