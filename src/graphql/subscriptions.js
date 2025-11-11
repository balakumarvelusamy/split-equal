export const onNewMessage = /* GraphQL */ `
  subscription OnNewMessage {
    onNewMessage {
      name
      email
      message
      date
      isdeleted
      groupId
    }
  }
`;
