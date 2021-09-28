import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const ArtistType = new GraphQLObjectType({
  name: "Artist",
  fields: () => ({
    Name: { type: GraphQLString },
    ArtistId: { type: GraphQLInt },
  }),
});
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      hello: {
        type: GraphQLString,
        resolve: async (_root, _args, ctx) => {
          const { hello } = await ctx.db.get(`SELECT 'world' AS hello`);
          return hello;
        },
      },
      artists: {
        type: GraphQLList(ArtistType),
        resolve: async (_root, _args, ctx) => {
          const res = await ctx.db.all(`SELECT * from artists`);
          return res;
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
      updateArtist: {
        type: ArtistType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: (_root, _args, ctx) => {
          const { id, name } = _args;

          ctx.db.run(
            "UPDATE artists SET Name = (?) WHERE ArtistId = (?);",
            [name, id],
            (err: any) => {
              if (err) {
                console.error(err, "EROOR");
              }
            }
          );
          pubsub.publish("ARTIST_MODIFIED", {
            subscribeArtist: { ArtistId: id, Name: name },
          });

          return { ArtistId: id, Name: name };
        },
      },
    }),
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: () => ({
      subscribeArtist: {
        type: ArtistType,
        subscribe: () => pubsub.asyncIterator("ARTIST_MODIFIED"),
      },
    }),
  }),
});
