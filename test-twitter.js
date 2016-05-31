var config = require('./config'),
    Twitter = require('twitter'),
    twitterBot = new Twitter(config.twitterKeys),
    Jimp = require('jimp'),
    imageURL = 'test-images/test.jpg',
    imageID = null,
    tweetText = 'Testing from Living Room #London'

/*
twitterBot.post('statuses/update', {status: tweetText},  function(error, tweet, response)
{
  if (error) 
  {
    console.error('statuses/update fail...')
    console.error(error)
  }  
  else
  {
    console.log('├ DONE! ' + tweet.text) 
    // console.log(response)
  } 
})
*/


Jimp.read(imageURL).then(function (image) 
{
  tweetImage(image)
}).catch(function (err) 
{
  console.error(err)
}) 

function tweetImage(image)
{
  console.log(image.bitmap.data)
  // console.log(image.buffer) // undefined

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

  /*if (config.testMode) 
  {
    console.log('├ In test mode, exiting...')
    return
  } */ 

  var status = 
  {
    status: tweetText,
    media_ids: imageID // Pass the media id string
  }

  twitterBot.post('statuses/update', status,  function(error, tweet, response)
  {
    if (error) 
    {
      console.error('statuses/update fail...')
      console.error(error)
    }  
    else
    {
      console.log('├ DONE! ' + tweet.text) 
      // console.log(response)
    } 
  })
}   