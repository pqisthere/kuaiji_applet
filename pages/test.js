const automator = require('miniprogram-automator');

// 测试用例
describe('Login Page', () => {
  let miniProgram;

  // 在每个测试用例之前启动小程序
  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: 'C:\\Users\\17378\\OneDrive\\桌面\\记账小程序', // 小程序项目路径
    });
  });

  // 在每个测试用例之后关闭小程序
  afterAll(async () => {
    await miniProgram.close();
  });

  // 测试输入账号和密码
  it('should input username and password', async () => {
    const page = await miniProgram.reLaunch('/pages/login/login');

    // 等待输入框加载完成
    await page.waitForSelector('.input');
    await page.waitForSelector('.name-input');

    // 输入账号
    await page.type('.input', '123456');

    // 输入密码
    await page.type('.name-input', '11111q');

    // 检查输入的账号和密码是否正确
    const inputUserName = await page.$('.input');
    const inputPassWord = await page.$('.name-input');
    expect(await inputUserName.attribute('value')).toBe('123456'); // 修改断言为输入的账号值
    expect(await inputPassWord.attribute('value')).toBe('11111q'); // 修改断言为输入的密码值
  });

  // 测试登录按钮是否可用
  it('输入账号密码后点击登录按钮', async () => {
    const page = await miniProgram.reLaunch('/pages/login/login');

    // 等待输入框加载完成
    await page.waitForSelector('.input');
    await page.waitForSelector('.name-input');
    await page.waitForSelector('.button');

    // 输入账号
    await page.type('.input', '123456');

    // 输入密码
    await page.type('.name-input', '11111q');

    // 点击登录按钮
    const loginButton = await page.$('.button');
    await loginButton.tap();

    // 延迟一段时间等待页面跳转或其他异步操作
    await page.waitFor(1000);

    // 在这里添加检查登录后的页面状态的断言
  });
});
