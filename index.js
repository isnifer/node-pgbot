import Bot from './lib/Bot';
import request from 'request';
import Q from 'q';
import { parseString, Parser } from 'xml2js'
import token from './token';

let bot = new Bot({token: });

let parser = new Parser({
    normalizeTags: true
});

var frontenders = ['@buhaev', '@BorisHorenko', '@glibin', '@scribblex', '@isnifer'];

bot.on('message', function (message) {
    var self = this;
    console.log(message);

    if (message.text && message.text.toLowerCase() === '@pgbot village') {
        request.get({url: 'http://www.the-village.ru/feeds/posts.atom?city=1&flow=new-place'}, function (err, res, body) {
            parser.parseString(body, function (err, result) {
                // console.dir(result.feed.entry[0].title);
                self.sendMessage({
                    chat_id: message.chat.id,
                    text: result.feed.entry[0].title + '\n' +result.feed.entry[0].id[0],
                    function () {
                       console.log('Сообщение отправлено!');
                    }
                });
            });
        });
    }

    if (message.text && message.text.toLowerCase() === '@pgbot привет') {
        this.sendMessage({
            chat_id: message.chat.id,
            text: 'Привет ' + message.from.first_name + ' ' + message.from.last_name},
            function () {
               console.log('Сообщение отправлено!');
            }
        );
    }

    if (message.text && message.text.toLowerCase().startsWith('/randomreview') ) {
        this.sendMessage({
            chat_id: message.chat.id,
            text: 'Попроси, например, ' + frontenders[Math.floor(Math.random() * 4) + 1]},
            function () {
               console.log('Сообщение отправлено!');
            }
        );
    }

    /*if (message.text) {
        this.sendMessage({
            chat_id: message.chat.id,
            text: 'УБЛЮДОК МАТЬ ТВОЮ А﻿ НУ ИДИ СЮДА ГОВНО СОБАЧЬЕ РЕШИЛ КО МНЕ ЛЕЗТЬ? ТЫ ЗАСРАНЕЦ ВОНЮЧИЙ МАТЬ ТВОЮ А? НУ ИДИ СЮДА ПОПРОБУЙ МЕНЯ ТРАХНУТЬ Я ТЕБЯ САМ ТРАХНУ УБЛЮДОК ОНАНИСТ ЧЁРТОВ БУДЬ ТЫ ПРОКЛЯТ ИДИ ИДИОТ ТРАХАТЬ ТЕБЯ И ВСЮ ТВОЮ СЕМЬЮ ГОВНО СОБАЧЬЕ ЖЛОБ ВОНЮЧИЙ ДЕРЬМО СУКА ПАДЛА ИДИ СЮДА МЕРЗАВЕЦ НЕГОДЯЙ ГАД ИДИ СЮДА ТЫ ГОВНО ЖОПА'},
            function () {
               console.log('Сообщение отправлено!');
            }
        );
    }*/
});

bot.start();
