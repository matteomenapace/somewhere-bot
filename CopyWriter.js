var tracery = require('tracery-grammar'),
    // pronouncing = require('pronouncing'),
    vocabulary = require('./vocabulary')

var rules = 
{
  'encouraging': vocabulary.encouraging,
  'weather': vocabulary.weather,
  'surface': vocabulary.surface,
  'verbing': vocabulary.verbing,
  'me': ['[sentence:I am][punctuation:.]', '[sentence:I feel][punctuation:.]', '[sentence:am I][punctuation:?]'],
  'you': ['[sentence:you seem][punctuation:.]', '[sentence:are you][punctuation:?]', '[sentence:you are][punctuation:.]'],
}

function generate(inputs)
{
	var origin =
  [
    'I feel like #weather# #surface#.', // metaphor
    '[#me#]#sentence.capitalize# #weather##punctuation#', // me
    '[#you#]#sentence.capitalize# #weather##punctuation#', // you
    '[#me#]#sentence.capitalize# #weather##punctuation# [#you#]#sentence.capitalize# #weather##punctuation#', // me and you
    '[#you#]#sentence.capitalize# #weather##punctuation# [#me#]#sentence.capitalize# #weather##punctuation#', // you and me
  ]

	if (inputs.place) // if there's a place, let's add an expansion for it
	{
		origin.push(inputs.place + ' is #encouraging#.')
	}	

	rules.origin = origin

	// console.log(rules)

	var grammar = tracery.createGrammar(rules)
	grammar.addModifiers(tracery.baseEngModifiers)

	var text = grammar.flatten('#origin#')/*,
      words = text.split(' '),
      lastWord = words[words.length - 1],
      rhymes = pronouncing.rhymes(lastWord)*/

  // console.log(text, rhymes)
  // console.log(text) 
  return text
}

module.exports = 
{
	generate: generate
}