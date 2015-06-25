var Bot = require('./lib/Bot');
var request = require('request');
var Q = require('q');
var Parser = require('xml2js').Parser;
var token = require('./token');

var bot = new Bot({token: token});

var parser = new Parser({
    normalizeTags: true
});

var frontenders = ['@buhaev', '@BorisHorenko', '@glibin', '@scribblex', '@isnifer'];

var messages = {
    hopesandfears: 'http://www.the-village.ru/feeds/posts.atom?city=1&topic=hopesandfears',
    apartments: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=apartments',
    onthestreet: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=on-the-street',
    newplace: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=new-place',
    interior: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=interior',
    broadcasting: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=broadcasting',
    moscowmorning: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=moscow-morning',
    news: 'http://www.the-village.ru/feeds/posts.atom?city=1&news=only'
};

var boobs = [
    'http://justboobshow.tumblr.com/rss',
    'http://bigawesomeboobs.tumblr.com/rss',
    'http://boobs-selfshots.tumblr.com/rss',
    'http://boobsinmotion.tumblr.com/rss',
    'http://boobsarethegreatest.tumblr.com/rss',
    'http://bbt12.tumblr.com/rss',
    'http://bestboobgif.tumblr.com/rss',
    'http://dreamwoman-boobs.tumblr.com/rss',
    'http://lovelyboobphotos.tumblr.com/rss',
    'http://mavrindiary.tumblr.com/rss'
];

function getRandom (maxValue) {
    return Math.floor(Math.random() * maxValue) + 1;
}

function getTheVillage (url, messageData, ctx, message) {
    var lastMessages = parseInt(messageData[1]);
    request.get({url: url}, function (err, res, body) {
        parser.parseString(body, function (err, result) {
            // console.dir(result.feed.entry[0].title);
            for (var i = 0; i < (!isNaN(lastMessages) ? lastMessages : 1); i++) {
                ctx.sendMessage({
                    chat_id: message.chat.id,
                    text: result.feed.entry[i].title + '\n' +result.feed.entry[i].id[0]
                });
            }
        });
    });
}

function getBoobs (url, messageData, ctx, message) {
    var lastMessages = parseInt(messageData[1]);
    lastMessages = !isNaN(lastMessages) ? lastMessages : 1;
    request.get({url: url}, function (err, res, body) {
        parser.parseString(body, function (err, result) {
            // console.dir(result.feed.entry[0].title);
            if (lastMessages > 1) {
                for (var i = 0; i < lastMessages; i++) {
                    ctx.sendMessage({
                        chat_id: message.chat.id,
                        text: result.rss.channel[0].item[i].link
                    });
                }
            } else {
                ctx.sendMessage({
                    chat_id: message.chat.id,
                    text: result.rss.channel[0].item[getRandom(19)].link
                });
            }
        });
    });
}

var subscribers = [];

bot.on('message', function (message) {
    var self = this;
    var messageData = message.text && message.text.toLowerCase();
    messageData = messageData && messageData.replace('@pgbot', '').split(' ');
    var command = messageData && messageData[0].slice(1);
    var index = subscribers.indexOf(message.chat.id);

    console.dir(message);

    if (message.text) {

        if (messages[command]) {
            getTheVillage(messages[command], messageData, self, message);
        }


        if (command === 'boobs') {
            getBoobs(boobs[getRandom(9)], messageData, self, message);
        }

        if (command === 'subscribe' && index === -1) {
            subscribers.push(message.chat.id);
        }

        if (command === 'unsubscribe' && index > -1) {
            subscribers.splice(index, 1);
            self.sendMessage({
                chat_id: message.chat.id,
                text: 'Вы успешно отписались от обновлений'
            });
        }

        if (command === 'forall') {
            subscribers.forEach(function (e, i) {
                self.sendMessage({
                    chat_id: e,
                    text: messageData.slice(1).join(' ')
                });
            });
        }

    }

    if (message.text && message.text.toLowerCase() === '@pgbot привет') {
        this.sendMessage({
            chat_id: message.chat.id,
            text: 'Привет ' + message.from.first_name + ' ' + message.from.last_name}
        );
    }

    if (message.text && message.text.toLowerCase() === '/randomreview@PgBot') {
        this.sendMessage({
            chat_id: message.chat.id,
            text: 'Попроси, например, ' + frontenders[getRandom(4)]}
        );
    }

});

bot.start();
