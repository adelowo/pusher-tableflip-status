const ROOM_ID = 'ROOM_ID';
// A newly created user will only be able to post a message after this time
const COOL_OFF_MINUTES = 5;

const usernameForm = document.getElementById('username-form');

usernameForm.addEventListener('submit', e => {
  e.preventDefault();

  const username = e.target.username.value;

  axios
    .post('http://localhost:5200/users', { username })
    .then(res => {
      const skipCooloff = res.data.skip_cooloff;
      let createdAt = 0;

      if (skipCooloff) {
        alert('This user is an existing user, there will be no cooloff ');
      } else {
        createdAt = res.data.created_at;
      }

      document.getElementById('join').style.display = 'none';
      document.getElementById('chatbox').style.display = 'block';

      const tokenProvider = new Chatkit.TokenProvider({
        url: 'http://localhost:5200/authenticate',
      });

      const chatManager = new Chatkit.ChatManager({
        instanceLocator: 'PUSHER_CHATKIT_INSTANCE_LOCATOR',
        userId: username,
        tokenProvider,
      });

      chatManager
        .connect()
        .then(currentUser => {
          currentUser
            .subscribeToRoom({
              roomId: ROOM_ID,
              hooks: {
                onMessage: message => {
                  const { senderId, text } = message;

                  const messageList = document.getElementById('messageList');
                  const messageUser = document.createElement('dt');
                  const messageBody = document.createElement('dd');

                  messageUser.appendChild(document.createTextNode(senderId));
                  messageBody.appendChild(document.createTextNode(text));

                  messageList.appendChild(messageUser);
                  messageList.appendChild(messageBody);
                },
                onPresenceChanged: (state, user) => {
                  if (state.current === 'offline') {
                    const elem = document.getElementById(user.id);
                    if (elem !== null) {
                      elem.remove();
                    }
                    return;
                  }

                  if (currentUser.id !== user.id) {
                    addUserElement(user);
                  }
                },
              },
              messageLimit: 100,
            })
            .then(() => {
              currentUser.rooms[0].users.forEach(user => {
                if (user.presence.state === 'online') {
                  addUserElement(user);
                }
              });

              const sendMessage = document.getElementById('sendMessage');
              sendMessage.addEventListener('submit', e => {
                e.preventDefault();

                if (!skipCooloff) {
                  const duration = moment.duration(
                    moment(Date.now()).diff(moment(createdAt))
                  );

                  if (duration.minutes() <= COOL_OFF_MINUTES) {
                    alert(
                      `You must be a member of this room for ${COOL_OFF_MINUTES} minutes before you can add a message`
                    );
                    return;
                  }
                }

                const message = e.target.message.value;

                currentUser.sendMessage({
                  text: message,
                  roomId: ROOM_ID,
                });

                e.target.message.value = '';
              });
            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
    })
    .catch(error => console.error(error));
});

function addUserElement(user) {
  const onlineUsers = document.getElementById('onlineUsers');
  const singleUser = document.createElement('li');

  singleUser.className = 'list-group-item';
  singleUser.id = user.id;

  singleUser.appendChild(document.createTextNode(user.name));
  onlineUsers.appendChild(singleUser);
}
