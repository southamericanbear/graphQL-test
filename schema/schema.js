const axios = require("axios");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLNonNull,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
    cookies: {
      type: graphql.GraphQLList(CookiesType),
      resolve(parentValues, args) {
        return axios
          .get(
            `http://localhost:3000/companies/${parentValues.id}/vegancookies`
          )
          .then((res) => res.data);
      },
    },
  }),
});

const CookiesType = new GraphQLObjectType({
  name: "Cookie",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    value: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValues, args) {
        return axios
          .get(`http://localhost:3000/companies/${parentValues.companyId}`)
          .then((res) => res.data);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    cookie: {
      type: CookiesType,
      args: { id: { type: GraphQLString } },
      resolve(parentValues, args) {
        return axios
          .get(`http://localhost:3000/veganCookies/${args.id}`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValues, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data)
          .catch((err) => console.log(err));
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addCookie: {
      type: CookiesType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        value: { type: new GraphQLNonNull(GraphQLInt) },
        company: { type: GraphQLString },
      },
      resolve(parentValue, { name, value }) {
        return axios
          .post("http://localhost:3000/veganCookies", { name, value })
          .then((res) => res.data);
      },
    },
    deleteCookie: {
      type: CookiesType,
      args: { id: { type: GraphQLNonNull(GraphQLString) } },
      resolve(parentValues, args) {
        return axios
          .delete(`http://localhost:3000/veganCookies/${args.id}`)
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      },
    },
    updateCookie: {
      type: CookiesType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        value: { type: GraphQLInt },
      },
      resolve(parentValues, { id, name, value }) {
        return axios
          .patch(`http://localhost:3000/veganCookies/${id}`, {
            name: name,
            value: value,
          })
          .then((res) => res.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
