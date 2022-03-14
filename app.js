const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');


const app = express();

app.use(bodyParser.json());
app.use('/graphql', graphqlHTTP({
	schema: graphqlSchema,
	rootValue: graphqlResolvers,
	graphiql: true
}));

mongoose.connect(`mongodb+srv://temp_user:${process.env.MONGO_PASSWORD}@cluster0.lqg8e.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
	.then(() => {
		app.listen(3000, () => {
			console.log('SERVER LISTENING TO 3000');
		});
	}).catch(err => {
		console.log(err);
	});