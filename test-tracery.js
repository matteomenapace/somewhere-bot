var tracery = require('tracery-grammar'),
		pronouncing = require('pronouncing'),
		vocabulary = require('./vocabulary')

var grammar = tracery.createGrammar(
{
  // 'emotion': vocabulary.emotion,
  'encouraging': vocabulary.encouraging,
  'weatherAdjective': vocabulary.weatherAdjective,
  'surface': vocabulary.surface,
  'verbing': vocabulary.verbing,
  'feeling': ['feeling', 'I am', 'I feel', 'being', 'I seem', 'you seem', 'are you'],
  'me': ['I am', 'I seem', 'am I'],
  'you': ['you seem', 'are you', 'you are'],
  
  'warning': 'This is #test.a# of the emergency #broadcastNouns# system. This is only #test.a#.',
  'testNouns': ['test', 'trial', 'experiment'],
  'broadcastNouns': ['broadcast', 'podcast', 'sitcom', 'documentary'],

	'phrase':
	[
  	'#feeling.capitalize# #weatherAdjective#', // feelings
		'I am #weatherAdjective# #surface#', // metaphor
		'This place is #encouraging#', // encouraging
		'#me.capitalize# #weatherAdjective#. #you.capitalize# #weatherAdjective#', // me and you 
		'#you.capitalize# #weatherAdjective#. #me.capitalize# #weatherAdjective#' // you and me
	],

  'origin':['#phrase#', '#[test:#testNouns#]warning#']
})

grammar.addModifiers(tracery.baseEngModifiers)

for (var i = 20; i >= 0; i--) 
{
	var starter = grammar.flatten('#origin#'),
			starters = starter.split(' '),
			lastWord = starters[starters.length - 1],
			rhymes = pronouncing.rhymes(lastWord)

	// console.log(starter, rhymes)
	console.log(starter) 
}  