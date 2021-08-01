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

describe('create conversation', () => {
  it('create conversation', async () => {
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
  });
});
