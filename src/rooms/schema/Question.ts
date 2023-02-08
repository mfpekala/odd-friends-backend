import { Schema, type } from "@colyseus/schema";
import { Answer } from "./Answer";
import { Guess } from "./Guess";

export class Question extends Schema {
  @type("string") question: string = "";
  @type([Answer]) answers: Answer[] = [];
  @type([Guess]) guesses: Guess[] = [];
}
