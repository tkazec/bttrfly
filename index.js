var EventEmitter = require("events").EventEmitter;

var async = require("async");
var voice = require("voice.js");

var format = function (message, contact) {
	return message.replace(/#{(.+?)}/g, function (m, prop) {
		return contact[prop];
	});
};

module.exports = function (options) {
	var stream = new EventEmitter();
	var client = new voice.Client(options);
	
	async.eachSeries(options.contacts, function (contact, next) {
		client.sms({
			to: contact.phone.toString(),
			text: format(options.message, contact)
		}, function (err) {
			stream.emit("send", err, contact);
			next();
		});
	}, function () {
		stream.emit("done");
	});
	
	return stream;
};