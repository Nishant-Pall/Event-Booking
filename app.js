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

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(`

		type Event {
			_id: ID!
			title: String!
			description: String!
			price: Float!
			date: String!
		}

		type User {
			_id: ID!
			email: String!
			password: String
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
				const events = await Event.find();
				return events.map(event => {
					return { ...event._doc, _id: event.id };
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
				const user = await User.findById('622dfcece05d89a92879d41c');
				if (!user) {
					throw new Error('User doesnt exist');
				}
				await user.createdEvents.push(event);
				await user.save();
				return createdEvent;

			} catch (error) {
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