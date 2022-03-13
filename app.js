const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = [];

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
		events: () => {
			return events;
		},
		createEvent: (args) => {
			const event = {
				_id: Math.random().toString(),
				title: args.eventInput.title,
				description: args.eventInput.description,
				price: +args.eventInput.price,
				date: args.eventInput.date
			};
			events.push(event);
			return event;
		}
	},
	graphiql: true
}));

app.listen(3000, () => {
	console.log('SERVER LISTENING TO 3000');
});