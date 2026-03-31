import java.util.ArrayList;
import com.backend.crazy8s.Card;
import java.util.List;

public class GameState {
    private String gameId; 
    private List<Card> deck;
    private List<List<Card>> hands;
    private List<Card> discardPile;
    private String currentSuit;
    private int currentPlayer;
    private int direction;
    private boolean skipNext;
    private int penaltyDraw;
    private String status;
    private String winner;

    public GameState() {}

    public GameState(String gameId) {
        this.gameId = gameId;
        this.deck = new ArrayList<>();
        this.hands = new ArrayList<>();
        this.discardPile = new ArrayList<>();
        this.direction = 1;
        this.currentPlayer = 0;
        this.skipNext = false;
        this.penaltyDraw = 0;
        this.status = "IN_PROGRESS";
    }

    // Getters
    public String getGameId() { return gameId; }
    public List<Card> getDeck() { return deck; }
    public List<List<Card>> getHands() { return hands; }
    public List<Card> getDiscardPile() { return discardPile; }
    public String getCurrentSuit() { return currentSuit; }
    public int getCurrentPlayer() { return currentPlayer; }
    public int getDirection() { return direction; }
    public boolean isSkipNext() { return skipNext; }
    public int getPenaltyDraw() { return penaltyDraw; }
    public String getStatus() { return status; }
    public String getWinner() { return winner; }

    // Setters
    public void setGameId(String gameId) { this.gameId = gameId; }
    public void setDeck(List<Card> deck) { this.deck = deck; }
    public void setHands(List<List<Card>> hands) { this.hands = hands; }
    public void setDiscardPile(List<Card> discardPile) { this.discardPile = discardPile; }
    public void setCurrentSuit(String currentSuit) { this.currentSuit = currentSuit; }
    public void setCurrentPlayer(int currentPlayer) { this.currentPlayer = currentPlayer; }
    public void setDirection(int direction) { this.direction = direction; }
    public void setSkipNext(boolean skipNext) { this.skipNext = skipNext; }
    public void setPenaltyDraw(int penaltyDraw) { this.penaltyDraw = penaltyDraw; }
    public void setStatus(String status) { this.status = status; }
    public void setWinner(String winner) { this.winner = winner; }
}