require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');

const app = express();

const chatkit = new Chatkit.default({
  instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR,
  key: process.env.CHATKIT_SECRET_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allUsers = [];

app.post('/users', (req, res) => {
  let { username } = req.body;

  username = username.trim();

  chatkit
    .createUser({
      id: username,
      name: username,
    })
    .then(() => {
      const now = Date.now();

      allUsers.push({ name: username, timestamp: now });
      res.status(201).send({ created_at: now });
    })
    .catch(err => {
      if (err.error === 'services/chatkit/user_already_exists') {
        const user = allUsers.find(u => {
          return u.name === username;
        });

        if (user === undefined) {
          res
            .status(500)
            .send({ error: "could not get user's registration date" });
          return;
        }

        res.status(200).json({ created_at: user.timestamp });
      } else {
        res.status(err.status).json(err);
      }
    });
});

app.post('/authenticate', (req, res) => {
  const authData = chatkit.authenticate({
    userId: req.query.user_id,
  });
  res.status(authData.status).send(authData.body);
});

app.set('port', process.env.PORT || 5200);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running on port ${server.address().port}`);
});
