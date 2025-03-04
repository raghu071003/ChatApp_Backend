import { UserSession } from "../Models/userSession.model.js";
import { determineWinner } from "../utils/RockPaperScissors.js";
import { GameRequest } from "../Models/GameRequest.model.js";

export const handleGameEvents = (io, socket) => {

  // Invite player to game
  socket.on("invite_game", async ({ player1, player2, gameType }) => {
    console.log(`🎮 Game invite from ${player1} to ${player2} (Game: ${gameType})`);

    try {
      const receiverSession = await UserSession.findOne({ userId: player2 });

      if (receiverSession) {
        // Store the game request in DB
        const newGame = new GameRequest({ player1, player2, gameType });
        await newGame.save();
        const roomId = newGame._id.toString(); // Using MongoDB's _id as roomId

        io.to(receiverSession.socketId).emit("game_invite", { player1, gameType, roomId });
        console.log(`📨 Game invite stored in DB and sent to ${receiverSession.socketId}`);
      }
    } catch (error) {
      console.error("Error creating game request:", error);
    }
  });

  // Accept game invite
  socket.on("accept_invite", async ({ roomId, player2 }) => {
    console.log(`✅ Game invite accepted for room: ${roomId}`);

    try {
      const game = await GameRequest.findById(roomId);

      if (!game || game.status !== "pending") {
        console.error("🚨 Game not found or already started!");
        return;
      }

      game.status = "accepted";
      await game.save();

      socket.join(roomId);

      // Retrieve sessions for both players
      const player1Session = await UserSession.findOne({ userId: game.player1 });
      const player2Session = await UserSession.findOne({ userId: player2 });

      if (player1Session) {
        const player1Socket = io.sockets.sockets.get(player1Session.socketId);
        if (player1Socket) {
          player1Socket.join(roomId);
        }
      }

      if (player1Session) io.to(player1Session.socketId).emit("game_accepted", { roomId });
      if (player2Session) io.to(player2Session.socketId).emit("game_accepted", { roomId });

      // Notify both players that the game has started
      io.to(roomId).emit("game_started", { roomId, gameType: game.gameType, player1: game.player1, player2 });

    } catch (error) {
      console.error("Error accepting game:", error);
    }
  });

  // Handle player moves
  socket.on("make_move", async ({ roomId, player, move }) => {
    console.log(`🎮 Player ${player} is making move: ${move}`);

    try {
      const game = await GameRequest.findById(roomId);

      if (!game || game.status !== "accepted") {
        console.error(`🚨 No active game found for room: ${roomId}`);
        return;
      }

      if (![game.player1.toString(), game.player2.toString()].includes(player)) {
        console.error(`⛔ Invalid move: Player ${player} is not in game ${roomId}`);
        return;
      }

      // Store the move in DB
      game.moves.set(player, move);
      await game.save();

      console.log(`🔍 Updated moves for game ${roomId}:`, game.moves);

      // Check if both players have made their moves
      if (game.moves.size === 2) {
        console.log("✅ Both players made their moves. Determining result...");

        const result = determineWinner(Object.fromEntries(game.moves)); // Convert Map to Object
        console.log("🏆 Game Result:", result);

        io.to(roomId).emit("game_result", result);

        // Update game status and remove after timeout
        game.status = "completed";
        await game.save();

        setTimeout(async () => {
          await GameRequest.findByIdAndDelete(roomId);
          console.log(`🗑️ Game ${roomId} cleared from DB.`);
        }, 5000);
      } else {
        console.log("⌛ Waiting for the second player to make a move...");
      }
    } catch (error) {
      console.error("Error handling move:", error);
    }
  });

  // Handle game over
  socket.on("game_over", async ({ roomId, winner }) => {
    try {
      io.to(roomId).emit("game_ended", { winner });
      await GameRequest.findByIdAndDelete(roomId);
      console.log(`🏁 Game ${roomId} ended and removed from DB.`);
    } catch (error) {
      console.error("Error ending game:", error);
    }
  });
};
