var Twit = require('twit');
var config = require('botfiles/config.js');
var T = new Twit(config);
var myText = require('botfiles/sample-text.js');

//a nice 'pick' function thanks to Darius Kazemi: https://github.com/dariusk
Array.prototype.pick = function() {
  return this[Math.floor(Math.random()*this.length)];
};

//functions
function tweetOK(phrase) {
  return phrase !== undefined && phrase !== "" && tweetLengthOK(phrase);
}

function tweetLengthOK(phrase) {
  return phrase.length <= 140;
}

function pickTweet(oldTweets, n) {
  var lastTweet = oldTweets[0].text;
  var idx = myText.indexOf(lastTweet) + 1 + n;
  if (idx >= myText.length) return;
  var tweetText = myText[idx];

  if (tweetOK(tweetText)) {
    return tweetText;
  }
  else {
    return pickTweet(n+1);
  }
}

function post(textToTweet) {
  T.post('statuses/update', { status: textToTweet }, function(err, reply) {
    if (err) {
      console.log('error:', err);
      context.fail();
    }
    else {
      console.log('tweet:', reply);
      context.succeed();
    }
  });
}

exports.handler = function myBot(event, context) {
  var getOptions = { screen_name: config.screen_name, count: 1 };
  T.get('statuses/user_timeline', getOptions, function(err, oldTweets) {
    if (err || !oldTweets.length) {
      console.log('error:', err);
      context.fail();
      return;
    }

    var textToTweet = pickTweet(oldTweets, 0);
    if (!textToTweet) {
      console.log('no more okay tweets');
      context.fail();
      return;
    }

    post(textToTweet);
  });
};

