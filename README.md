# pusher-tableflip-status

How to limit new users from posting in a Chatkit room until after a specified
period of time. With this, a user will not be able to post until 5 minutes after
the time (s)he was created.
This is quite popular in online communities, take Discord as an example https://support.discordapp.com/hc/en-us/articles/216679607-What-are-Verification-Levels-

#### Prerequisites

- Node.js ( `>=8` )
- A [Pusher Chatkit](https://dash.pusher.com) application.

#### Getting started

You have to clone this repository before moving on `git clone git@github.com:adelowo/pusher-tableflip-status.git`.

To run the backend server, you will need to run

```
$ cd server
$ node index.js
```
> You will need to edit the file located at `server/variables.env`

To run the react frontend application.

```

$ cd client
$ python -m http.server 8000

```

> You  will need to updae line 1 and 25 of `client/app.js` after which you can then visit http://localhost:8000


## Built With

- [Pusher Chatkit](https:dash.pusher.com) - APIs to enable devs build realtime chat applications.
- NodeJS
