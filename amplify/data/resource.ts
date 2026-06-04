import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Feedback: a.model({
    name: a.string().required(),
    rating: a.integer().required(),
    comment: a.string().required(),
  })
  .authorization(allow => [allow.guest()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
