import { DiscordClient, config, SelectMenu, Button, Message } from "./lib";

const client = new DiscordClient({
  token: config.token,
  applicationId: config.appId,
  logger: {
    enabled: true,
    debug: true,
  },
});

async function bootstrap() {
  await client.gateway.login();

  const genericInteraction = client.interactions.register(() => {
    console.log("interaction triggered");
  });

  await client.sendMessage(
    "837812905410953266",
    Message.create({
      content: "Hello world",
      components: [
        [
          Button.create(
            {
              label: "Click me first",
              onInteract: genericInteraction,
            },
            client
          ),
          Button.create(
            {
              label: "Click me second",
              onInteract: genericInteraction,
            },
            client
          ),
        ],
        [
          SelectMenu.create(
            {
              options: [
                { label: "One", value: "1" },
                { label: "Two", value: "2" },
                { label: "three", value: "3" },
                {
                  label: "Four",
                  value: "4",
                  description: "Four is special",
                  default: true,
                },
                { label: "Five", value: "5" },
              ],
              minValue: 1,
              maxValue: 5,
              onInteract: genericInteraction,
            },
            client
          ),
        ],
      ],
    })
  );
  console.log("sent message successfully");
}

bootstrap();
