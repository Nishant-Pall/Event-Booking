const Event = require('../../models/event');
const bcrypt = require('bcryptjs/dist/bcrypt');
const User = require('../../models/user');
const Booking = require('../../models/booking');

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

const singleEvent = async eventId => {
	try {
		const event = await Event.findById(eventId);
		return { ...event._doc, _id: event.id, creator: user.bind(this, event.creator) };
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
	bookings: async () => {
		try {
			const bookings = await Booking.find();
			return bookings.map(booking => {
				return {
					...booking._doc, _id: booking.id,
					user: user.bind(this, booking._doc.user),
					event: singleEvent.bind(this, booking._doc.event),
					createdAt: new Date(booking._doc.createdAt).toISOString,
					updatedAt: new Date(booking._doc.updatedAt).toISOString
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
	},
	bookEvent: async args => {
		const fetchedEvent = await Event.findOne({ _id: args.eventId });
		const booking = new Booking({
			user: '622f8363adff3f0482e65ca5',
			event: fetchedEvent
		});
		const result = await booking.save();
		return {
			...result._doc, _id: result.id,
			user: user.bind(this, booking._doc.user),
			event: singleEvent.bind(this, booking._doc.event),
			createdAt: new Date(result._doc.createdAt).toISOString,
			updatedAt: new Date(result._doc.updatedAt).toISOString
		};
	},
	cancelBooking: async args => {
		try {
			const booking = await Booking.findById(args.bookingId).populate('event');
			const event = { ...booking.event._doc, _id: booking.event.id, creator: user.bind(this, booking.event._doc.creator) };
			await Booking.deleteOne({ _id: args.bookingId });
			return event;
		} catch (err) {
			throw err;
		}
	}
};