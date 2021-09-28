import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const ArtistType = new GraphQLObjectType({
  name: "Artist",
  fields: () => ({
    Name: { type: GraphQLString },
    ArtistId: { type: GraphQLString }
  })
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
        }
      },
      artists: {
        type: ArtistType,
        resolve: async (_root, _args, ctx) => {
          const res = await ctx.db.get(`SELECT * from artists`);
          console.log(res);
          return res;
        }
      }
    })
  })
});
