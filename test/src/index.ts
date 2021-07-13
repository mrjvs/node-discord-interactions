import { InteractionContext } from "../../src/interaction/InteractionContext";
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

  const genericInteraction = client.interactions.register(
    (ctx: InteractionContext) => {
      console.log(
        `interaction triggered by: @${ctx.interaction.raw.member.user.username}#${ctx.interaction.raw.member.user.discriminator}`
      );
      switch (ctx.interaction.raw.data?.values?.[0]) {
        default:
        case "1":
          console.log("interaction acknowledged");
          ctx.interaction.acknowledge();
          break;
        case "2":
          console.log("interaction sent loading (hidden)");
          ctx.interaction.sendLoading(true);
          break;
        case "3":
          console.log("interaction sent loading (public)");
          ctx.interaction.sendLoading();
          break;
        case "4":
          console.log("interaction sent response (hidden)");
          ctx.interaction.respond(
            Message.create({
              content:
                "Hello world (and just for you, you deserve all the good things in life, stay happy)",
            }),
            true
          );
          break;
        case "5":
          console.log("interaction sent response (public)");
          ctx.interaction.respond(
            Message.create({
              content: "Hello world (public)",
            })
          );
          break;
        case "6":
          console.log("interaction updated message");
          ctx.interaction.updateMessage(
            Message.create({
              content: "The button has been pressed",
            })
          );
          break;
      }
    }
  );

  await client.sendMessage(
    "837812905410953266",
    Message.create({
      content: "Choose your own adventure",
      components: [
        [
          SelectMenu.create(
            {
              options: [
                {
                  label: "Dont do anything",
                  value: "1",
                  description: "I swear, I wont do anything",
                },
                {
                  label: "Infinite loader",
                  value: "3",
                  description: "Loading until the heatdeath of the universe",
                },
                {
                  label: "Secret infinite loader",
                  value: "2",
                  description: "Same as above, but in secret",
                },
                {
                  label: "Send a message",
                  value: "5",
                  description: "Just a normal message",
                },
                {
                  label: "Send a secret",
                  value: "4",
                  description: "A message just for you",
                },
                {
                  label: "Update this message",
                  value: "6",
                  description: "Will destruct the menu, be careful",
                },
              ],
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
