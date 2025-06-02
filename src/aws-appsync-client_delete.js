// src/aws-appsync-client.js
import { AWSAppSyncClient } from "aws-appsync";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloLink } from "@apollo/client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "@apollo/client";

const url = "https://m24bivvguzhttlxrar4grzwzum.appsync-api.ap-south-1.amazonaws.com/graphql";
const region = "ap-south-1";
const apiKey = "da2-xvk63jh7xrhbfjvwswqg7imlju";

const client = new AWSAppSyncClient(
  {
    url,
    region,
    auth: {
      type: "API_KEY",
      apiKey,
    },
    disableOffline: true,
  },
  {
    link: ApolloLink.from([createAuthLink({ url, region, auth: { type: "API_KEY", apiKey } }), createSubscriptionHandshakeLink({ url, region, auth: { type: "API_KEY", apiKey } }, new HttpLink({ uri: url }))]),
    cache: new InMemoryCache(),
  }
);

export default client;
