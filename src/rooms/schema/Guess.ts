import { Schema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { Bet } from "./Bet";

export class Guess extends Schema {
  @type(Player) player: Player;
  @type("number") value: number = 0;
  @type([Bet]) bets: Bet[] = [];
}
