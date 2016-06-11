var tracery = require('tracery-grammar'),
    pronouncing = require('pronouncing'),
    vocabulary = require('./vocabulary')

var grammar = tracery.createGrammar(
{
  // 'emotion': vocabulary.emotion,
  'encouraging': vocabulary.encouraging,
  'weather': vocabulary.weather,
  'surface': vocabulary.surface,
  'verbing': vocabulary.verbing,
  'me': ['[sentence:I am][punctuation:.]', '[sentence:I feel][punctuation:.]', '[sentence:am I][punctuation:?]'],
  'you': ['[sentence:you seem][punctuation:.]', '[sentence:are you][punctuation:?]', '[sentence:you are][punctuation:.]'],

  'phrase':
  [
    'I feel like #weather# #surface#.', // metaphor
    // 'This place is #encouraging#', // encouraging
    '[#me#]#sentence.capitalize# #weather##punctuation#', // me
    '[#you#]#sentence.capitalize# #weather##punctuation#', // you
    '[#me#]#sentence.capitalize# #weather##punctuation# [#you#]#sentence.capitalize# #weather##punctuation#', // me and you
    '[#you#]#sentence.capitalize# #weather##punctuation# [#me#]#sentence.capitalize# #weather##punctuation#', // you and me
    // '#phrase# #phrase#' // repeat :)
  ],

  'origin':['#phrase#']
})

grammar.addModifiers(tracery.baseEngModifiers)

function generate(inputs)
{
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