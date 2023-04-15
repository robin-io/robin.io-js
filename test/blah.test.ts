import { Robin } from '../src';

// describe('initialize robin', () => {
//   it('works', () => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");

//     expect(robin.baseUrl).toEqual("http://67.207.75.186/api/v1")
//     expect(robin.wsUrl).toEqual("ws://67.207.75.186/ws")
//   });
// });

// describe('create user token', () => {
//   it('works', async () => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', false, 3, "dev");
//     let user_token = await robin.createUserToken({
//       meta_data: {
//         name: 'Elvis',
//       },
//     });
//   });
// });

// describe('get robin session', () => {
//   jest.setTimeout(50000)
//   it('works', async () => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     try {
//       let sessionToken = await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")
//       console.log(sessionToken)
//     } catch (e) {
//       console.log(e)
//     }
    
//   });
// });

// describe('get user token', () => {
//   jest.setTimeout(50000)
//   it('works', async() => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")

//     let get_user = await robin.getUserToken(20, 1);

//     console.log(get_user.data.paginated_conversations)
//     expect(get_user).toBeDefined()
//   })
// })

// describe('sync user token', () => {
//   it('works', async() => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")

//     let syncUser = await robin.syncUserToken({
//       meta_data: {
//         "email": "farawe6@acumen.com.ng",
//         "fullname": "Taiwo6",
//         "name": "Taiwo6",
//         "age": 11
//       },
//     });

//     expect(syncUser).toBeDefined()
//   })
// })

// describe('conversation flow', () => {
//   jest.setTimeout(50000)
//   it('works', async () => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")
//     // create conversation
//     let conversation = await robin.createConversation({
//       sender_name: 'Farawe Taiwo',
//       receiver_name: 'Jay Willz',
//       receiver_token: 'kTaxSkhWIAmTojVvOdRnlkDg',
//     });

//     console.log(conversation)
//     // 634f1b95bdca092511a84f0d

//     expect(conversation).toBeDefined()
//   });
// });

// describe('get conversation messages', () => {
//   jest.setTimeout(50000)
//   it('works', async() => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")
//     // get conversation messages
//     let getConversationMessages = await robin.getConversationMessages(
//       "6384bd81ed6d765c23582576",
//       100,
//       1
//     );

//     console.log(getConversationMessages)

//     expect(getConversationMessages).toBeDefined()
//   })
// })

// describe('search conversation', () => {
//   jest.setTimeout(50000)
//   it('works', async() => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")

//     let searchConversation = await robin.searchConversation(
//       '6384bd81ed6d765c23582576',
//       'hola',
//       100,
//       1
//     );

//     console.log(searchConversation)

//     expect(searchConversation).toBeDefined()
    
//   })
// })

// describe('delete message', () => {
//   jest.setTimeout(50000)
//   it('works', async() => {
//     let robin = new Robin('NT-UAzQwycFjXwvGfeciRyVumTWjfUFCImrRFQH', true, 3, "dev");
//     await robin.GetSession("CwJUzaISPWhkoEseoLteRLDn")

//     let deleteMessages = await robin.deleteMessages(['63569907bf0184c1b6c69c91']);
//     console.log(deleteMessages)
//     expect(deleteMessages).toBeDefined()
//   })
// })

// describe('group conversation flow', () => {
//   it('works', async () => {
//     let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');

//     //create group conversation

//     const participants = [
//       {
//         user_token: 'ZTPpGIpJvbbjVeGjfAiTSoFW',
//         meta_data: {
//           name: 'Elvis',
//         },
//       },
//     ];

//     let createGroupConversation = await robin.createGroupConversation(
//       'Test Group',
//       participants
//     );

//     expect(createGroupConversation.error).toEqual(false);

//     // assign group moderator
//     let assignGroupModerator = await robin.assignGroupModerator(
//       createGroupConversation.data._id,
//       'ZTPpGIpJvbbjVeGjfAiTSoFW'
//     );

//     expect(assignGroupModerator.error).toEqual(false);

//     // add group participants
//     let addGroupParticipants = await robin.addGroupParticipants(
//       createGroupConversation.data._id,
//       participants
//     );

//     expect(addGroupParticipants.error).toEqual(false);

//     // remove group participant
//     let removeGroupParticipant = await robin.removeGroupParticipant(
//       createGroupConversation.data._id,
//       'ZTPpGIpJvbbjVeGjfAiTSoFW'
//     );

//     expect(removeGroupParticipant.error).toEqual(false);
//   });
// });

// describe('web socket connection', () => {
//   let connection: WebSocket;
//   let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
//   it('works', () => {
//     const conn = robin.connect(5)
//     connection = conn
//   })
//   it('works for subscription', () => {
//     robin.subscribe("chat", connection)
//   })
// })

// describe('test forward message', () => {
//   it('works', () => {
//     let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
//     console.log(robin.forwardMessages([], []))
//   })
// })

// describe('test read receipts', () => {
//     it('works', () => {
//         let robin = new Robin('NT-LSTTN.......hKtoqqTEhbXGGZxaQbp');
//         robin.sendReadReceipts([''], '')
//     });
// });

// describe('test groupIconUpload', () => {
//   it('works',  async () => {
//     let robin = new Robin("NT-qBsdCDfPFYQkAKcfxMeNgSXvYTmqakOBVYRr")
//     var res = await robin.uploadGroupIcon("61ba10ae72dd084adf81c2d0", new File([], 'elf.txt'))
//     console.log(res)
//   })
// })