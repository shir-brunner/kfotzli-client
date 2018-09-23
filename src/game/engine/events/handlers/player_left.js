module.exports = {
    handle(data, world) {
        let playerToRemove = world.players.find(player => player.id === data.playerId);
        world.players = world.players.filter(player => player.id !== playerToRemove.id);

        if (world.players.length < world.level.minPlayers)
            world.worldEvents.addEvent('GAME_OVER', { reason: 'TOO_FEW_PLAYERS', leavingPlayerName: playerToRemove.name });
    }
}