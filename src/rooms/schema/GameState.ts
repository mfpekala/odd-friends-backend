import { Schema, Context, type } from "@colyseus/schema";
import { Player } from "./Player";
import { Question } from "./Question";

/*

mark spitballing here.

Initial version I'm going for will have X rounds:
 - Answer: Players are all given the question and must answer with a number
 - Guess: Players submit guesses for what they think the { mean, min, max, mode, variance} is
 - Bet: Players see all the guesses sorted and place bets
 - Reveal: Players see the correct answer
 - Summary: Check in on scores, leader goes to next round
*/

export const DUPLICATE_SESSION_ID = 1;
export const DUPLICATE_NAME = 2;

export type RoundState =
  | "lobby"
  | "answer"
  | "guess"
  | "bet"
  | "reveal"
  | "summary";

export class GameState extends Schema {
  @type(Player) leader: Player;
  @type([Player]) players: Player[] = [];
  @type("number") gameRound: number = -1;
  @type("string") roundState: RoundState = "lobby";
  @type("number") timer: number = 0;
  @type([Question]) questions: Question[] = [];
}
