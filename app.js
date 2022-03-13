const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

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
					return { ...event._doc };
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
				date: new Date(args.eventInput.date)
			});
			try {
				const result = await event.save();
				return { ...result._doc };

			} catch (error) {
				throw err;
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