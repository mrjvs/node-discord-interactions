export class EmbedBuilder {
  // color
  #color?: number;
  setColor(color: number | undefined): EmbedBuilder {
    this.#color = color;
    return this;
  }
  get color(): number | undefined {
    return this.#color;
  }

  // title
  #title?: string;
  setTitle(text: string | undefined): EmbedBuilder {
    this.#title = text;
    return this;
  }
  get title(): string | undefined {
    return this.#title;
  }

  // description
  #description?: string;
  setDescription(text: string | undefined): EmbedBuilder {
    this.#description = text;
    return this;
  }
  get description(): string | undefined {
    return this.#description;
  }

  get raw(): any {
    return {
      title: this.title,
      description: this.description,
      color: this.#color,
    };
  }
}
