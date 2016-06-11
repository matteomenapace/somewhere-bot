var copyWriter = require('./CopyWriter')

for (var i = 23; i >= 0; i--) 
{
  var string = copyWriter.generate({place:'London'})/*,
      words = string.split(' '),
      lastWord = words[words.length - 1],
      rhymes = pronouncing.rhymes(lastWord)*/

  // console.log(string, rhymes)
  console.log(string) 
}  