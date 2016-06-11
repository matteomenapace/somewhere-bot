var copyWriter = require('./CopyWriter')

for (var i = 20; i >= 0; i--) 
{
  var string = copyWriter.generate()/*,
      words = string.split(' '),
      lastWord = words[words.length - 1],
      rhymes = pronouncing.rhymes(lastWord)*/

  // console.log(string, rhymes)
  console.log(string) 
}  