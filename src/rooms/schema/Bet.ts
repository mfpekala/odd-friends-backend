import { Schema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class Bet extends Schema {
  @type(Player) player: Player;
  @type("number") wager: number;
}
