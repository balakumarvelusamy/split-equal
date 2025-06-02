export const sendMessage = /* GraphQL */ `
  mutation SendMessage($groupId: String!, $chat: ChatMessageInput!) {
    sendMessage(groupId: $groupId, chat: $chat) {
      name
      email
      message
      date
      isdeleted
      groupId
    }
  }
`;
