import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "";
  @type("string") sessionId: string = "";
  @type("number") money: number = 0;
}
