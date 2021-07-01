import { EmbedBuilder, MessageBuilder } from "../../src/message/MessageBuilder";
import { DiscordClient, config } from "./lib";

const client = new DiscordClient({
  token: config.token,
});

async function bootstrap() {
  await client.gateway.login();

  const message = new MessageBuilder()
    .setContent("Hello world")
    .addEmbed(new EmbedBuilder().setDescription("Description here"))
    .addEmbed(
      new EmbedBuilder()
        .setColor(128)
        .setDescription("Description here")
        .setTitle("Hello world 2")
    );
  // await client.sendMessage("837812905410953266", message);
  console.log("sent message successfully");
}

bootstrap();
