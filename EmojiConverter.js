var EmojiData = require('emoji-data-2016'),
		countryLookup = require('country-data').lookup

/*var flagsMap = 
{
	US: '1F1FA-1F1F8'
}*/

function getCountryCode(countryName)
{
  var country = countryLookup.countries({name: countryName})[0]
  // console.log(country)
  return country.alpha2
}

function getEmoji(countryName)
{
	var emoji = null,
			countryCode = getCountryCode(countryName)

	if (countryCode)
	{
		// console.log('Finding an emoji for ' + countryCode)
		emoji = EmojiData.from_short_name(countryCode) 
		if (!emoji) emoji = EmojiData.from_short_name('flag-' + countryCode) 
		// EmojiData.from_unified(flagsMap[countryCode])
		// if (emoji) console.log(emoji.render())
	}	
			
	return emoji
}

module.exports = 
{
	getEmoji: getEmoji
}

/*
getEmoji('United States')
getEmoji('Kyrgyzstan')
getEmoji('Thailand')
getEmoji('Italy')
getEmoji('Poland')
getEmoji('France')
getEmoji('United Kingdom')
getEmoji('Canada')
getEmoji('Germany')
getEmoji('Japan')
getEmoji('Ireland')
// getEmoji('')
*/