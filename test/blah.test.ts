import { Robin } from '../src';

describe('initialize robin', () => {
  it('works', () => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");

    expect(robin.baseUrl).toEqual("http://67.207.75.186/api/v1")
    expect(robin.wsUrl).toEqual("ws://67.207.75.186/ws")
  });
});

describe('create user token', () => {
  it('works', async () => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");
    let user_token = await robin.createUserToken({
      meta_data: {
        name: 'Elvis',
      },
    });
  });
});

describe('get user token', () => {
  it('works', async() => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");

    let get_user = await robin.getUserToken({
      user_token: "dhkogzyIxbAQwFnKDNTfAKOU",
    }, 20, 1);

    console.log(get_user.paginated_conversations)
    expect(get_user).toBeDefined()
  })
})

describe('sync user token', () => {
  it('works', async() => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");

    let syncUser = await robin.syncUserToken({
      user_token: "dhkogzyIxbAQwFnKDNTfAKOU",
      meta_data: {
        name: 'Elvis',
      },
    });

    expect(syncUser).toBeDefined()
  })
})

describe('conversation flow', () => {
  it('works', async () => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");

    // create conversation
    let conversation = await robin.createConversation({
      sender_name: 'Elvis',
      sender_token: 'dhkogzyIxbAQwFnKDNTfAKOU',
      receiver_name: 'Raji',
      receiver_token: 'lRHBiKVLvSkyxUvLqqYhGhIV',
    });

    console.log(conversation)
    // 634f1b95bdca092511a84f0d

    expect(conversation).toBeDefined()
  });
});

describe('get conversation messages', () => {
  it('works', async() => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");
    // get conversation messages
    let getConversationMessages = await robin.getConversationMessages(
      "634f1b95bdca092511a84f0d",
      'user-token',
      100,
      1
    );

    console.log(getConversationMessages)

    expect(getConversationMessages).toBeDefined()
  })
})

describe('search conversation', () => {
  it('works', async() => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");
    let searchConversation = await robin.searchConversation(
      '634f1b95bdca092511a84f0d',
      'hola',
      100,
      1
    );

    console.log(searchConversation)

    expect(searchConversation).toBeDefined()
    
  })
})

describe('delete message', () => {
  it('works', async() => {
    let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");
    let deleteMessages = await robin.deleteMessages(['63569907bf0184c1b6c69c91'], 'requester-token');
    console.log(deleteMessages)
    expect(deleteMessages).toBeDefined()
  })
})

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

describe('test groupIconUpload', () => {
  it('works',  async () => {
    let robin = new Robin("NT-qBsdCDfPFYQkAKcfxMeNgSXvYTmqakOBVYRr")
    var res = await robin.uploadGroupIcon("61ba10ae72dd084adf81c2d0", new File([], 'elf.txt'))
    console.log(res)
  })
})