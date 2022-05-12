import { InteractionContext } from "../../src/interaction/InteractionContext";
import { MessageInputType } from "../../src/message/components/ComponentTypes";
import { DiscordClient, config, SelectMenu, Message, Input } from "./lib";

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

  const modalSubmit = client.interactions.register((ctx) => {
    console.log(JSON.stringify(ctx.interaction.raw, null, 2));
    ctx.interaction.acknowledge();
  });

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
          ctx.interaction.respondMessage(
            Message.create({
              content:
                "Hello world (and just for you, you deserve all the good things in life, stay happy)",
            }),
            true
          );
          break;
        case "5":
          console.log("interaction sent response (public)");
          ctx.interaction.respondMessage(
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
        case "7":
          console.log("interaction updated message");
          ctx.interaction.respondModal(
            "Dad jokes modal",
            [
              Input.create(
                {
                  style: MessageInputType.SHORT,
                  label: "Your name",
                  id: "name",
                },
                client
              ),
              Input.create(
                {
                  style: MessageInputType.PARAGRAPH,
                  label: "Your best dad joke",
                  id: "joke",
                },
                client
              ),
            ],
            modalSubmit
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
                {
                  label: "Show me modals",
                  value: "7",
                  description: "give me your best dad jokes!",
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

bootstrap().catch((err) => console.error(err));
