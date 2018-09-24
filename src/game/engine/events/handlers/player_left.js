module.exports = {
    handle(data, world) {
        let playerToRemove = world.players.find(player => player.id === data.playerId);
        world.players = world.players.filter(player => player.id !== playerToRemove.id);

        if (world.players.length < world.level.minPlayers) {
            world.worldEvents.addEvent('GAME_OVER', {
                reason: 'TOO_FEW_PLAYERS',
                leavingPlayerName: playerToRemove.name
            });
        } else if (playerToRemove.team && !world.players.find(player => player.team === playerToRemove.team))
            world.worldEvents.addEvent('GAME_OVER', { reason: 'EMPTY_TEAM', team: playerToRemove.team });
    }
}