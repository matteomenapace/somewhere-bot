var config = require('./config'),
    translator = require('yandex-translate-api')(config.yandexKey),
    countryLookup = require('country-data').lookup,
    greetings = 'Meditating in Beja #Portugal',
    name = 'Portugal',
    country = countryLookup.countries({name: name})[0],
		options = country ? {to: country.languages[0]} : {to: name.toLowerCase().substring(0, 3)}

console.log(country)		

translator.translate(greetings, options, function(err, res) 
{
  console.log(res.text)
})