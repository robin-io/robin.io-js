import { Robin } from '../src';

describe('initialize robin', () => {
  it('works', () => {
    let robin = new Robin('NT-LSTTNiKdEQyAagVBdhKtoqqTEhbXGGZxaQbp');
    console.log(robin.apiKey);
    // expect(new Robin()).toEqual(2);
  });
});

describe('create user token & get User token', () => {
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
  });
});
