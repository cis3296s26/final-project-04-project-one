package com.backend.crazy8s;

public class Room {
    private String roomCode;
    private String gameId;
    private String[] playerIds;   // index = slot (0-3), null = empty/CPU
    private String[] playerNames; // display name per slot, "CPU" if empty
    private String status;        // "WAITING" or "IN_PROGRESS"

    public Room(String roomCode) {
        this.roomCode = roomCode;
        this.playerIds = new String[4];
        this.playerNames = new String[]{"CPU", "CPU", "CPU", "CPU"}; //Need frontend username input
        this.status = "WAITING";
    }

    // Returns the slot index of the given playerId, or -1 if not found
    public int getSlotOf(String playerId) {
        for (int i = 0; i < 4; i++) {
            if (playerId.equals(playerIds[i])) return i;
        }
        return -1;
    }

    // Returns the first empty slot index, or -1 if the room is full
    public int nextOpenSlot() {
        for (int i = 0; i < 4; i++) {
            if (playerIds[i] == null) return i;
        }
        return -1;
    }

    // Returns the number of human players currently in the room
    public int humanCount() {
        int count = 0;
        for (String id : playerIds) if (id != null) count++;
        return count;
    }

    //Getters and Setters for LobbyService, LobbyController, and GameService
    
    public String getRoomCode() { return roomCode; }
    public String getGameId() { return gameId; }
    public String[] getPlayerIds() { return playerIds; }
    public String[] getPlayerNames() { return playerNames; }
    public String getStatus() { return status; }

    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public void setGameId(String gameId) { this.gameId = gameId; }
    public void setPlayerIds(String[] playerIds) { this.playerIds = playerIds; }
    public void setPlayerNames(String[] playerNames) { this.playerNames = playerNames; }
    public void setStatus(String status) { this.status = status; }
}
