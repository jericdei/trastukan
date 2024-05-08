interface Message {
  user: string;
  message: string;
}

let users: Set<string> = new Set([]);
let messages: Message[] = [];

const socket = Bun.serve<{ user: string }>({
  async fetch(req, server) {
    const url = new URL(req.url);

    const user = url.searchParams.get("user") || "anonymous";

    const success = server.upgrade(req, {
      data: {
        user,
      },
    });

    return success
      ? undefined
      : new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    open(ws) {
      users.add(ws.data.user);

      ws.subscribe("trastukan");

      ws.publish(
        "trastukan",
        JSON.stringify({ type: "USERS_ADD", data: ws.data.user })
      );

      ws.send(JSON.stringify({ type: "USERS_SET", data: [...users] }));
      ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));
    },
    async message(ws, data) {
      const message = JSON.parse(data as any) as Message;

      message.user = ws.data.user;

      messages.push(message);

      ws.publish(
        "trastukan",
        JSON.stringify({ type: "MESSAGES_ADD", data: message })
      );
    },
    close(ws) {
      users = new Set([...users].filter((user) => user !== ws.data.user));

      ws.publish(
        "trastukan",
        JSON.stringify({ type: "USERS_REMOVE", data: ws.data.user })
      );
    },
  },
});

console.log(`Listening on ${socket.hostname}:${socket.port}`);
