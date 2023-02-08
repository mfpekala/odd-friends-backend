import { Schema, MapSchema } from "@colyseus/schema";
import { Room, Client, Delayed } from "colyseus";
import {
  DUPLICATE_NAME,
  DUPLICATE_SESSION_ID,
  RoundState,
  GameState,
} from "./schema/GameState";
import { Answer } from "./schema/Answer";
import { Guess } from "./schema/Guess";
import { Player } from "./schema/Player";
import { Question } from "./schema/Question";

export const LOOP_INTERVAL = 100;

export class GameRoom extends Room<GameState> {
  gameLoop: Delayed;
  maxClients: 6;

  findPlayerIx({
    name,
    sessionId,
  }: {
    name?: string;
    sessionId?: string;
  }): number {
    let ix = -1;
    this.state.players.forEach((testPlayer, index) => {
      if (testPlayer.sessionId === sessionId) {
        ix = index;
      } else if (testPlayer.name === name) {
        ix = index;
      }
    });
    return ix;
  }

  findPlayerBySessionId(sessionId: string): Player | null {
    const ix = this.findPlayerIx({ sessionId });
    if (ix < 0) return null;
    return this.state.players[ix];
  }

  findPlayer(client: Client): Player | null {
    return this.findPlayerBySessionId(client.sessionId);
  }

  getActiveQuestion(): Question | null {
    if (
      this.state.gameRound < 0 ||
      this.state.questions.length <= this.state.gameRound
    ) {
      return null;
    }
    return this.state.questions[this.state.gameRound];
  }

  onCreate(options: any) {
    this.setState(new GameState());

    this.gameLoop = this.clock.setInterval(() => this.loop(), LOOP_INTERVAL);

    this.onMessage("identifyPlayer", (client, data: { name: string }) => {
      const newPlayer = new Player();
      newPlayer.name = data.name;
      newPlayer.sessionId = client.sessionId;
      let dup_id_ix = this.findPlayerIx({ sessionId: newPlayer.sessionId });
      let dup_name_ix = this.findPlayerIx({ name: newPlayer.name });
      if (dup_id_ix < 0 && dup_name_ix < 0) {
        this.state.players.push(newPlayer);
        if (!this.state.leader) {
          this.state.leader = newPlayer;
        }
      }
      if (dup_id_ix >= 0) {
        client.error(DUPLICATE_SESSION_ID, "Duplicate player session id");
      }
      if (dup_name_ix >= 0) {
        client.error(DUPLICATE_NAME, "Duplicate player name");
      }
    });

    this.onMessage(
      "updateRoundState",
      (client, data: { roundState: RoundState }) => {
        console.log("updating to", data.roundState);
        this.state.roundState = data.roundState;
        switch (data.roundState) {
          case "answer":
            this.state.gameRound += 1;
            this.state.timer = 30000;
            const newQuestion = new Question();
            newQuestion.question = "Test question?";
            newQuestion.answers = [];
            newQuestion.guesses = [];
            this.state.questions.push(newQuestion);
            break;
        }
      }
    );

    this.onMessage("answer", (client, data: { answer: number }) => {
      const activeQuestion = this.getActiveQuestion();
      if (!activeQuestion) return;
      const player = this.findPlayer(client);
      const newAnswer = new Answer();
      newAnswer.player = player;
      newAnswer.value = data.answer;
      activeQuestion.answers.push(newAnswer);
      this.state.questions[this.state.gameRound] = activeQuestion;
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    const ix = this.findPlayerIx({ sessionId: client.sessionId });
    if (ix >= 0) {
      this.state.players.splice(ix, 1);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  loop() {
    if (this.state.timer > 0) {
      this.state.timer = Math.max(0, this.state.timer - LOOP_INTERVAL);
    }
    if (this.state.timer <= 0) {
      switch (this.state.roundState) {
        case "answer":
          this.state.timer = 30000;
          this.state.roundState = "guess";
          break;
        case "guess":
          this.state.timer = 30000;
          this.state.roundState = "bet";
          break;
        case "bet":
          this.state.roundState = "reveal";
          break;
        case "reveal":
          this.state.roundState = "summary";
          break;
      }
    }
  }
}
