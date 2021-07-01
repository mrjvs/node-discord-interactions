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

  // const message = new MessageBuilder()
  //   .setContent("Hello world")
  //   .addEmbed(new EmbedBuilder().setDescription("Description here"))
  //   .addEmbed(
  //     new EmbedBuilder()
  //       .setColor(128)
  //       .setDescription("Description here")
  //       .setTitle("Hello world 2")
  //   );
  // message
  //   .addComponent(
  //     new MessageActionRowBuilder().addComponent(
  //       new MessageButtonBuilder()
  //         .setLabel("Button label")
  //         .setStyle(MessageButtonType.SUCCESS)
  //     )
  //   )
  //   .addComponent(
  //     new MessageActionRowBuilder().addComponent(
  //       new MessageButtonBuilder()
  //         .setLabel("Button label")
  //         .setStyle(MessageButtonType.SUCCESS)
  //     )
  //   );
  // const data = await client.sendMessage("837812905410953266", message);

  const message = new MessageBuilder().setContent("What are you?");
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
  );
  message.addComponent(actionRow);
  const data = await client.sendMessage("837812905410953266", message);
  console.log("sent message successfully", data);
}

bootstrap();
