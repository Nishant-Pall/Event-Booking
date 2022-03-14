const { buildSchema } = require('graphql');

module.exports = buildSchema(`
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
`);