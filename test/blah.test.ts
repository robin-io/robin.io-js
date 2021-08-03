import { Robin } from '../src';

describe('initialize robin', () => {
  it('works', () => {
    let robin = new Robin('NT-LSTTNiKdEQyAagVBdhKtoqqTEhbXGGZxaQbp');
    console.log(robin.apiKey);
    // expect(new Robin()).toEqual(2);
  });
});

describe('create user token & get User token & sync user token', () => {
  it('works', async () => {
    let robin = new Robin('NT-LSTTNiKdEQyAagVBdhKtoqqTEhbXGGZxaQbp');
    let user_token = await robin.createUserToken({
      meta_data: {
        name: 'Elvis',
      },
    });

    // console.log(user_token)

    expect(user_token.error).toEqual(false);

    let get_user = await robin.getUserToken({
      user_token: user_token.data.user_token,
    });

    // console.log(get_user, "here")

    expect(get_user.error).toEqual(false);

    let syncUser = await robin.syncUserToken({
      user_token: user_token.data.user_token,
      meta_data: {
        name: 'Elvis',
      },
    });

    expect(syncUser.error).toEqual(false);
  });
});

describe('conversation flow', () => {
  it('works', async () => {
    let robin = new Robin('NT-LSTTNiKdEQyAagVBdhKtoqqTEhbXGGZxaQbp');

    // create conversation
    let conversation = await robin.createConversation({
      sender_name: 'Elvis',
      sender_token: 'ZTPpGIpJvbbjVeGjfAiTSoFW',
      receiver_name: 'Raji',
      receiver_token: 'aeoDIJouCbHovPkZqaDDRtiT',
    });

    expect(conversation.error).toEqual(false);

    // get conversation messages
    let getConversationMessages = await robin.getConversationMessages(
      conversation.data._id
    );

    expect(getConversationMessages.error).toEqual(false);

    // search conversation
    let searchConversation = await robin.searchConversation(
      conversation.data._id,
      'Hi'
    );

    expect(searchConversation.error).toEqual(false);

    // delete messages
    let deleteMessages = await robin.deleteMessages('609ee76bec2d4ec11f258ea7');

    expect(deleteMessages.error).toEqual(false);

    //create group conversation
    const moderator = {
      user_token: 'aeoDIJouCbHovPkZqaDDRtiT',
      meta_data: {
        name: 'Raji',
      },
    };

    const participants = [
      {
        user_token: 'ZTPpGIpJvbbjVeGjfAiTSoFW',
        meta_data: {
          name: 'Elvis',
        },
      },
    ];

    let createGroupConversation = await robin.createGroupConversation(
      'Test Group',
      moderator,
      participants
    );

    expect(createGroupConversation.error).toEqual(false);
  });
});
