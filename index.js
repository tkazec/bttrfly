var async = require("async");
var voice = require("voice.js");

var format = function (message, contact) {
	return message.replace(/#{(.+?)}/g, function (m, prop) {
		return contact[prop];
	});
};

module.exports = function (options, onsend, ondone) {
	var client = new voice.Client({
		email: options.user,
		password: options.pass,
		tokens: options.tokens
	});
	
	if (!ondone) {
		ondone = onsend;
		onsend = undefined;
	}
	
	async.eachSeries(options.contacts, function (contact, next) {
		if (contact.skip) {
			return setImmediate(next);
		}
		
		if (!options.dry) {
			client.sms({
				to: contact.phone.toString(),
				text: format(options.message, contact)
			}, function (err, res, msg) {
				err = err || (msg.send_sms_response !== 0 ? "sms res " + msg.send_sms_response : null);
				
				if (onsend) {
					if (onsend(err, contact) === false) {
						return next("canceled");
					}
				}
				
				setTimeout(next, 1000);
			});
		} else {
			if (onsend) {
				onsend(format(options.message, contact), contact);
			}
			
			setImmediate(next);
		}
	}, function (err) {
		if (ondone) {
			if (!options.dry) {
				ondone(err, client.getTokens());
			} else {
				ondone(err);
			}
		}
	});
};