const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs/dist/bcrypt');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const events = async (eventIds) => {
	try {
		const events = await Event.find({ _id: { $in: eventIds } });
		return events.map(event => {
			return { ...event._doc, _id: event.id, creator: user.bind(this, event._doc.creator) };
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

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(`

		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String!
			creator: User!
		}

		type User {
			_id: ID!
			email: String!
			password: String
			createdEvents: [Event!]
		}

		input UserType {
			email: String!
			password: String
		}

		input EventType {
			title: String!
			description: String!
			price: Float!
			date: String!
		}

		type rootQuery {
			events: [Event!]!
		}

		type rootMutation {
			createEvent(eventInput: EventType): Event
			createUser(userInput: UserType): User
		}

		schema {
			query: rootQuery
			mutation: rootMutation
		}
	`),
	rootValue: {
		events: async () => {
			try {
				// const events = await Event.find().populate('creator');
				const events = await Event.find();
				return events.map(event => {
					return { ...event._doc, _id: event.id, creator: user.bind(this, event._doc.creator) };
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
				creator: '622dfcece05d89a92879d41c'
			});
			try {
				const createdEvent = await event.save();
				const fetchedUser = await User.findById('622dfcece05d89a92879d41c');
				if (!fetchedUser) {
					throw new Error('User doesnt exist');
				}
				await fetchedUser.createdEvents.push(event);
				await fetchedUser.save();
				return { ...createdEvent._doc, _id: createdEvent.id, creator: user.bind(this, createdEvent._doc.creator) };

			} catch (err) {
				throw err;
			}
		},
		createUser: async (args) => {

			const existingUser = await User.findOne({ email: args.userInput.email });
			if (existingUser) {
				throw new Error('User exists already');
			}
			else {
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
		}
	},
	graphiql: true
}));

mongoose.connect(`mongodb+srv://temp_user:${process.env.MONGO_PASSWORD}@cluster0.lqg8e.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
	app.listen(3000, () => {
		console.log('SERVER LISTENING TO 3000');
	});
}).catch(err => {
	console.log(err);
});