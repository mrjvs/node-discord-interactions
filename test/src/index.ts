import {
  DiscordClient,
  config,
  MessageSelectMenuBuilder,
  MessageBuilder,
  MessageActionRowBuilder,
} from "./lib";

const client = new DiscordClient({
  token: config.token,
});

async function bootstrap() {
  await client.gateway.login();

  const genericInteraction = client.interactions.register(() => {
    console.log("interaction triggered");
  });

  const message = new MessageBuilder().setContent("Who are you?");
  const actionRow = new MessageActionRowBuilder().addComponent(
    new MessageSelectMenuBuilder()
      .addOption({
        label: "Hello world",
        value: "1",
        description: "The hello that the world said",
      })
      .addOption({
        label: "An idiot sandwhich",
        value: "2",
        description: "gordon ramsay being haha",
      })
      .setPlaceholder("Select an option, or not, idc!")
      .onInteract(genericInteraction)
  );
  message.addComponent(actionRow);
  client.sendMessage("837812905410953266", message);
  console.log("sent message successfully");
}

bootstrap();
