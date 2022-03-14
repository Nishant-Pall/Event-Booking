const Event = require('../../models/event');
const bcrypt = require('bcryptjs/dist/bcrypt');
const User = require('../../models/user');

const events = async (eventIds) => {
	try {
		const events = await Event.find({ _id: { $in: eventIds } });
		return events.map(event => {
			return {
				...event._doc, _id: event.id,
				date: new Date(event._doc.date).toISOString(),
				creator: user.bind(this, event._doc.creator)
			};
		});
	} catch (err) {
		throw err;
	}
};

const user = async (userId) => {
	try {
		const user = await User.findById(userId);
		return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) };
	} catch (err) {
		throw err;
	}
};

module.exports = {
	events: async () => {
		try {
			// const events = await Event.find().populate('creator');
			const events = await Event.find();
			return events.map(event => {
				return {
					...event._doc, _id: event.id,
					date: new Date(event._doc.date).toISOString(),
					creator: user.bind(this, event._doc.creator)
				};
			});
		} catch (err) {
			throw err;
		}
	},
	createEvent: async (args) => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price,
			date: new Date(args.eventInput.date),
			creator: '622f8363adff3f0482e65ca5'
		});
		try {
			const createdEvent = await event.save();
			const fetchedUser = await User.findById('622f8363adff3f0482e65ca5');
			if (!fetchedUser) {
				throw new Error('User doesnt exist');
			}
			await fetchedUser.createdEvents.push(event);
			await fetchedUser.save();
			return {
				...createdEvent._doc,
				_id: createdEvent.id,
				date: new Date(event._doc.date).toISOString(),
				creator: user.bind(this, createdEvent._doc.creator)
			};

		} catch (err) {
			throw err;
		}
	},
	createUser: async (args) => {

		const existingUser = await User.findOne({ email: args.userInput.email });
		if (existingUser) {
			throw new Error('User exists already');
		}
		try {
			const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
			const user = new User({
				email: args.userInput.email,
				password: hashedPassword
			});
			const result = await user.save();
			return { ...result._doc, _id: result.id, password: null };
		} catch (err) {
			throw err;
		}
	}
};