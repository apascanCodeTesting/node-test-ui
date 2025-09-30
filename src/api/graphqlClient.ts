import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

// The client is intentionally unused for now. We keep it to mirror the original setup and
// to surface unused dependency warnings in quality scanners.
export const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.SCAN_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
})
