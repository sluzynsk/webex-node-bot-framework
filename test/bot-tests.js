/* bot-tests.js
 *
 * A set of tests to validate framework functionality
 * when framework is created using a bot token
 */

const Framework = require('../lib/framework');
const Webex = require('webex');
console.log('Starting bot-tests...');

// Initialize the framework and user objects once for all the tests
let framework, userWebex;
require('dotenv').config();
if ((typeof process.env.BOT_API_TOKEN === 'string') &&
  (typeof process.env.USER_API_TOKEN === 'string') &&
  (typeof process.env.HOSTED_FILE === 'string')) {
  framework = new Framework({ token: process.env.BOT_API_TOKEN });
  userWebex = new Webex({ credentials: process.env.USER_API_TOKEN });
} else {
  console.error('Missing required evnvironment variables:\n' +
    '- BOT_API_TOKEN -- token associatd with an existing bot\n' +
    '- USER_API_TOKEN -- token associated with an existing user\n' +
    '- HOSTED_FILE -- url to a file that can be attached to test messages\n' +
    'The tests will create a new space with the bot and the user');
  process.exit(-1);
}

// Load the common module which includes functions and variables
// shared by multiple tests
var common = require("./common/common");
common.setFramework(framework);
common.setUser(userWebex);

// Start up an instance of framework that we will use across multiple tests
describe('#framework', () => {
  // Validate that framework starts and that we have a valid user
  before(() => common.initFramework('framework init', framework, userWebex));

  //Stop framework to shut down the event listeners
  after(() => common.stopFramework('shutdown framework', framework));

  // Run some basic validation against the framework methods
  // Could probably get rid of these if they are used internally by the other tests
  require('./common/framework-functions.js');

  // Test bot interactions in a user created test space
  require('./as-bot/user-created-room-tests.js');

  // Test bot interactions in a bot created test space
  require('./as-bot/bot-created-room-tests.js');

  // Test bot's membership functions
  require('./common/bot-membership-tests.js');

  // Test bot functions for direct messaging
  // These only work if the test bot and test user already have a direct space
  require('./common/bot-direct-message-tests.js');
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function () {
  framework.debug('stoppping...');
  framework.stop().then(function () {
    process.exit();
  });
});
