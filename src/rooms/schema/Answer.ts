import { Schema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class Answer extends Schema {
  @type(Player) player: Player;
  @type("number") value: number = 0;
}
