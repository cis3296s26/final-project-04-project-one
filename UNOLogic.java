import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

/**
 * UnoLogic - 4 Player Game (User, Player 2, Player 3, Player 4)
 * Rules: Wild=Choose Color, Skip=Skip Next, Reverse=Change Direction, Draw 2=Next draws 2, Wild Draw 4=Choose Color + Next draws 4.
 * Starting Hand: 7 Cards
 */
public class UNOLogic {

    static class Card {
        String color;
        String value;

        Card(String color, String value) {
            this.color = color;
            this.value = value;
        }

        @Override
        public String toString() {
            if (color.equals("Wild")) return value;
            return color + " " + value;
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean overallRunning = true;

        while (overallRunning) {
            // 1. Setup Deck (Uno Style)
            List<Card> deck = new ArrayList<>();
            String[] colors = {"Red", "Yellow", "Blue", "Green"};
            String[] values = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Skip", "Reverse", "Draw 2"};

            for (String color : colors) {
                for (String value : values) {
                    deck.add(new Card(color, value));
                }
            }
            // Add Wild Cards
            for (int i = 0; i < 4; i++) {
                deck.add(new Card("Wild", "Wild"));
                deck.add(new Card("Wild", "Wild Draw 4"));
            }
            Collections.shuffle(deck);

            // 2. Setup 4 Players with 7 cards each
            List<List<Card>> hands = new ArrayList<>();
            String[] playerNames = {"User", "Player 2", "Player 3", "Player 4"};
            for (int i = 0; i < 4; i++) {
                List<Card> hand = new ArrayList<>();
                for (int j = 0; j < 7; j++) hand.add(deck.remove(0));
                hands.add(hand);
            }

            // 3. Setup Discard Pile
            List<Card> discardPile = new ArrayList<>();
            Card firstCard = deck.remove(0);
            while (firstCard.color.equals("Wild")) { // Ensure first card isn't wild
                deck.add(firstCard);
                Collections.shuffle(deck);
                firstCard = deck.remove(0);
            }
            discardPile.add(firstCard);
            String currentColor = firstCard.color;

            int currentPlayer = 0;
            int direction = 1; 
            boolean skipNext = false;
            int penaltyDraw = 0;
            boolean gameRunning = true;

            System.out.println("\n=== NEW GAME OF UNO ===");

            // 4. Main Game Loop
            while (gameRunning) {
                String name = playerNames[currentPlayer];
                Card topCard = discardPile.get(discardPile.size() - 1);
                
                // Check for skips
                if (skipNext) {
                    System.out.println(name + " was skipped!");
                    skipNext = false;
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                    continue;
                }

                // Check for penalties (Draw 2 / Draw 4)
                if (penaltyDraw > 0) {
                    System.out.println(name + " must draw " + penaltyDraw + " cards!");
                    for (int i = 0; i < penaltyDraw; i++) {
                        if (!deck.isEmpty()) hands.get(currentPlayer).add(deck.remove(0));
                    }
                    penaltyDraw = 0;
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                    continue;
                }

                if (currentPlayer == 0) {
                    // --- USER TURN ---
                    boolean turnOver = false;
                    while (!turnOver) {
                        System.out.println("\n--- YOUR TURN (User) ---");
                        System.out.println("Discard Pile Top: " + topCard + (topCard.color.equals("Wild") ? " (Color: " + currentColor + ")" : ""));
                        System.out.println("1. Draw a card");
                        System.out.println("2. See my cards");
                        System.out.println("3. Play a card");
                        System.out.println("4. Say UNO!");
                        System.out.println("5. Quit Current Game");
                        System.out.print("Choose: ");

                        String choice = scanner.nextLine().trim();
                        if (choice.equals("1")) {
                            if (!deck.isEmpty()) {
                                Card drawn = deck.remove(0);
                                hands.get(0).add(drawn);
                                System.out.println("You drew: " + drawn);
                            }
                            turnOver = true;
                        } else if (choice.equals("2")) {
                            for (int i = 0; i < hands.get(0).size(); i++) {
                                System.out.println((i + 1) + ". " + hands.get(0).get(i));
                            }
                        } else if (choice.equals("3")) {
                            System.out.println("\n--- YOUR HAND ---");
                            for (int i = 0; i < hands.get(0).size(); i++) {
                                System.out.println((i + 1) + ". " + hands.get(0).get(i));
                            }
                            System.out.print("Card number: ");
                            try {
                                int idx = Integer.parseInt(scanner.nextLine().trim()) - 1;
                                Card s = hands.get(0).get(idx);
                                
                                // UNO Match Rules
                                boolean canPlay = s.color.equals("Wild") || s.color.equals(currentColor) || s.value.equals(topCard.value);
                                
                                if (canPlay) {
                                    hands.get(0).remove(idx);
                                    discardPile.add(s);
                                    currentColor = s.color;
                                    
                                    System.out.println("You played: " + s);
                                    
                                    if (s.color.equals("Wild")) {
                                        System.out.print("New color (1-Red, 2-Yellow, 3-Blue, 4-Green): ");
                                        String sc = scanner.nextLine().trim();
                                        if (sc.equals("1")) currentColor = "Red";
                                        else if (sc.equals("2")) currentColor = "Yellow";
                                        else if (sc.equals("3")) currentColor = "Blue";
                                        else currentColor = "Green";
                                        System.out.println("Color is now " + currentColor);
                                        
                                        if (s.value.equals("Wild Draw 4")) penaltyDraw = 4;
                                    } else if (s.value.equals("Skip")) skipNext = true;
                                    else if (s.value.equals("Reverse")) direction *= -1;
                                    else if (s.value.equals("Draw 2")) penaltyDraw = 2;
                                    
                                    // Automatic shout for now
                                    if (hands.get(0).size() == 1) System.out.println("USER: UNO!");
                                    turnOver = true;
                                } else {
                                    System.out.println("Invalid Move.");
                                }
                            } catch (Exception e) { System.out.println("Error selecting card."); }
                        } else if (choice.equals("4")) {
                            System.out.println("You shouted UNO!");
                            // Future infrastructure: Set a flag to avoid penalty
                        } else if (choice.equals("5")) {
                            gameRunning = false;
                            turnOver = true;
                        }
                    }
                } else {
                    // --- CPU TURN (Simple Ladder) ---
                    System.out.println("\n--- " + name + "'s TURN ---");
                    List<Card> myHand = hands.get(currentPlayer);
                    Card play = null;

                    // Ladder 1: Match Color or Value
                    for (Card c : myHand) {
                        if (!c.color.equals("Wild") && (c.color.equals(currentColor) || c.value.equals(topCard.value))) {
                            play = c; break;
                        }
                    }
                    // Ladder 2: Play Wild
                    if (play == null) {
                        for (Card c : myHand) if (c.color.equals("Wild")) { play = c; break; }
                    }

                    if (play != null) {
                        myHand.remove(play);
                        discardPile.add(play);
                        System.out.println(name + " played: " + play);
                        
                        if (play.color.equals("Wild")) {
                            currentColor = colors[new java.util.Random().nextInt(4)];
                            System.out.println(name + " changed color to " + currentColor);
                            if (play.value.equals("Wild Draw 4")) penaltyDraw = 4;
                        } else {
                            currentColor = play.color;
                            if (play.value.equals("Skip")) skipNext = true;
                            else if (play.value.equals("Reverse")) direction *= -1;
                            else if (play.value.equals("Draw 2")) penaltyDraw = 2;
                        }
                        if (myHand.size() == 1) System.out.println(name + ": UNO!");
                    } else {
                        if (!deck.isEmpty()) {
                            myHand.add(deck.remove(0));
                            System.out.println(name + " drew a card.");
                        } else {
                            System.out.println(name + " skipped.");
                        }
                    }
                }

                if (hands.get(currentPlayer).isEmpty()) {
                    System.out.println("\n" + name.toUpperCase() + " WINS!");
                    gameRunning = false;
                } else {
                    currentPlayer = (currentPlayer + direction + 4) % 4;
                }
            }

            System.out.print("\nPlay again? (y/n): ");
            if (!scanner.nextLine().trim().toLowerCase().equals("y")) overallRunning = false;
        }
        System.out.println("Thanks for playing UNO!");
        scanner.close();
    }
}
