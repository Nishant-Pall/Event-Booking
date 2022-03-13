const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(`

		type rootQuery {
			events: [String!]!
		}

		type rootMutation {
			createEvent(name:String):String
		}

		schema {
			query: rootQuery
			mutation: rootMutation
		}
	`),
	rootValue: {
		events: () => {
			return ['Coding', 'Gaming'];
		},
		createEvent: (args) => {
			const eventName = args.name;
			return eventName;
		}
	},
	graphiql: true
}));

app.listen(3000, () => {
	console.log('SERVER LISTENING TO 3000');
});