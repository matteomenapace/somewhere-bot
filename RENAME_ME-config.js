module.exports = 
{
  // Get yours at https://apps.twitter.com
  twitterKeys:
  {
    consumer_key: 'YOUR_TWITTER_APP_CONSUMER_KEY',
    consumer_secret: 'YOUR_TWITTER_APP_CONSUMER_SECRET',
    access_token_key: 'YOUR_TWITTER_APP_TOKEN_KEY',
    access_token_secret: 'YOUR_TWITTER_APP_TOKEN_SECRET'
  },
  // Get yours at https://tech.yandex.com/keys/?service=trnsl
  yandexKey: 'YOUR_YANDEX_TRANSLATE_API_KEY',

  zoom: 3, // the zoom level for Google StreetView (1-5)
  x: 3, // with zoom=3 there are 6 columns, x=3 gives you the "back of the Google Car" view
  y: 1, // with zoom=3 there are 3 rows, y=1 gives you a good balance (not too much sky, not too much road)

  testMode: true // if true, the bot will generate images and , but WON'T tweet anything
}