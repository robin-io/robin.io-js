import { Robin } from '../src';

describe('initialize robin', () => {
  it('works', () => {
    let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
    console.log(robin.apiKey);
    // expect(new Robin()).toEqual(2);
  });
});

describe('create user token & get User token & sync user token', () => {
  it('works', async () => {
    let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
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
    let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');

    // create conversation
    let conversation = await robin.createConversation({
      sender_name: 'Elvis',
      sender_token: 'XVgQSLEhOFAXnIKiuXQbtdYY',
      receiver_name: 'Raji',
      receiver_token: 'aeoDIJouCbHovPkZqaDDRtiT',
    });

    console.log(conversation)

    expect(conversation.error).toEqual(false);

    // get conversation messages
    let getConversationMessages = await robin.getConversationMessages(
      conversation.data._id,
      'user-token'
    );

    expect(getConversationMessages.error).toEqual(false);

    // search conversation
    let searchConversation = await robin.searchConversation(
      conversation.data._id,
      'Hi'
    );

    expect(searchConversation.error).toEqual(false);

    // delete messages
    let deleteMessages = await robin.deleteMessages(['609ee76bec2d4ec11f258ea7'], 'requester-token');

    expect(deleteMessages.error).toEqual(false);
  });
});

describe('group conversation flow', () => {
  it('works', async () => {
    let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');

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

    // assign group moderator
    let assignGroupModerator = await robin.assignGroupModerator(
      createGroupConversation.data._id,
      'ZTPpGIpJvbbjVeGjfAiTSoFW'
    );

    expect(assignGroupModerator.error).toEqual(false);

    // add group participants
    let addGroupParticipants = await robin.addGroupParticipants(
      createGroupConversation.data._id,
      participants
    );

    expect(addGroupParticipants.error).toEqual(false);

    // remove group participant
    let removeGroupParticipant = await robin.removeGroupParticipant(
      createGroupConversation.data._id,
      'ZTPpGIpJvbbjVeGjfAiTSoFW'
    );

    expect(removeGroupParticipant.error).toEqual(false);
  });
});

describe('web socket connection', () => {
  let connection: WebSocket;
  let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
  it('works', () => {
    const conn = robin.connect('ZTPpGIpJvbbjVeGjfAiTSoFW', 5)
    connection = conn
  })
  it('works for subscription', () => {
    robin.subscribe("chat", connection)
  })
})

describe('test forward message', () => {
  it('works', () => {
    let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
    console.log(robin.forwardMessages("", [], []))
  })
})

describe('test read receipts', () => {
    it('works', () => {
        let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
        robin.sendReadReceipts([''], '', '')
    });
});

// describe('test groupIconUpload', () => {
//   it('works',  async () => {
//     let robin = new Robin("NT-qBsdCDfPFYQkAKcfxMeNgSXvYTmqakOBVYRr")
//     var res = await robin.uploadGroupIcon("61ba10ae72dd084adf81c2d0", new File([], 'elf.txt'))
//     console.log(res)
//   })
// })