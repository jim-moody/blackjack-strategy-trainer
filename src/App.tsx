import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import {
  Card,
  Decision,
  createDeck,
  getPerfectStrategyDecision,
} from './utils/blackjack';

// Types
type GameState = {
  playerCards: Card[];
  dealerCards: Card[];
  deck: Card[];
  score: number;
  correctDecisions: number;
  totalDecisions: number;
  lastDecision?: Decision;
  lastCorrectDecision?: Decision;
  showFeedback: boolean;
  showDealerCards: boolean;
  aceMode: boolean;
};

// Helper functions moved outside the loop
const isBlackjack = (cards: Card[]) => {
  const hasAce = cards.some(card => card.value === 'A');
  const hasTen = cards.some(card => ['10', 'J', 'Q', 'K'].includes(card.value));
  return hasAce && hasTen;
};

const removeCardsAtIndices = (deck: Card[], indices: number[]) => {
  return deck.filter((_, index) => !indices.includes(index));
};

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameContainer = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  background: #2a2a2a;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  justify-content: center;
  height: 100px;
`;

const DealerCardContainer = styled.div`
  display: flex;
  margin: 20px auto;
  justify-content: center;
  padding: 0 35px;
  position: relative;
  width: 140px;
  height: 100px;
`;

const CardElement = styled(motion.div)<{ isRed?: boolean; isHidden?: boolean; isDealer?: boolean; index?: number }>`
  width: 70px;
  height: 100px;
  background: ${props => props.isHidden ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: ${props => props.isRed ? '#ff0000' : '#000000'};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: ${props => props.isHidden ? '2px dashed #ffffff' : 'none'};
  position: ${props => props.isDealer ? 'absolute' : 'static'};
  left: ${props => props.isDealer ? `${props.index ? props.index * 5 : 0}px` : 'auto'};
  z-index: ${props => props.isDealer ? '1' : 'auto'};
  transform: ${props => props.isDealer ? 'translateX(0)' : 'none'};
  transition: transform 0.3s ease;

  &:hover {
    transform: ${props => props.isDealer ? 'translateX(5px)' : 'none'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #4a4a4a;
  color: white;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: #5a5a5a;
  }
  &:disabled {
    background: #2a2a2a;
    cursor: not-allowed;
  }
`;

const StatsContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
`;

const FeedbackMessage = styled(motion.div)<{ isCorrect: boolean }>`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  background: ${props => props.isCorrect ? '#4CAF50' : '#f44336'};
  color: white;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div<{ isActive: boolean }>`
  width: 50px;
  height: 24px;
  background: ${props => props.isActive ? '#4CAF50' : '#4a4a4a'};
  border-radius: 12px;
  position: relative;
  transition: background 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.isActive ? '28px' : '2px'};
    transition: left 0.3s ease;
  }
`;

function App() {
  const [gameState, setGameState] = useState<GameState>({
    playerCards: [],
    dealerCards: [],
    deck: [],
    score: 0,
    correctDecisions: 0,
    totalDecisions: 0,
    showFeedback: false,
    showDealerCards: false,
    aceMode: false,
  });

  const startNewHand = useCallback(() => {
    let currentDeck = gameState.deck.length < 10 ? createDeck() : [...gameState.deck];
    let playerCards: Card[];
    let dealerCards: Card[];

    do {
      if (gameState.aceMode) {
        // Find an Ace in the deck
        const aceIndex = currentDeck.findIndex(card => card.value === 'A');
        if (aceIndex === -1) {
          currentDeck = createDeck();
          playerCards = [currentDeck[0], currentDeck[1]];
        } else {
          // Take the Ace and another random card
          const ace = currentDeck[aceIndex];
          const otherCard = currentDeck[(aceIndex + 1) % currentDeck.length];
          playerCards = [ace, otherCard];
          // Remove used cards from deck using the pure function
          const indicesToRemove = [aceIndex, (aceIndex + 1) % currentDeck.length];
          currentDeck = removeCardsAtIndices(currentDeck, indicesToRemove);
        }
      } else {
        playerCards = [currentDeck[0], currentDeck[1]];
        currentDeck = currentDeck.slice(2);
      }

      dealerCards = [currentDeck[0], currentDeck[1]];
      currentDeck = currentDeck.slice(2);

      // If either hand is blackjack, try again
      if (isBlackjack(playerCards) || isBlackjack(dealerCards)) {
        currentDeck = createDeck();
      }
    } while (isBlackjack(playerCards) || isBlackjack(dealerCards));

    setGameState(prev => ({
      ...prev,
      playerCards,
      dealerCards,
      deck: currentDeck,
      lastDecision: undefined,
      lastCorrectDecision: undefined,
      showFeedback: false,
      showDealerCards: false,
    }));
  }, [gameState.deck, gameState.aceMode]);

  const handleDecision = (decision: Decision) => {
    const correctDecision = getPerfectStrategyDecision(
      gameState.playerCards,
      gameState.dealerCards[0]
    );

    const isCorrect = decision === correctDecision;

    setGameState(prev => ({
      ...prev,
      lastDecision: decision,
      lastCorrectDecision: correctDecision,
      showFeedback: true,
      showDealerCards: true,
      correctDecisions: isCorrect ? prev.correctDecisions + 1 : prev.correctDecisions,
      totalDecisions: prev.totalDecisions + 1,
      score: isCorrect ? prev.score + 1 : prev.score - 1,
    }));

    // Start new hand after 2 seconds
    setTimeout(startNewHand, 2000);
  };

  useEffect(() => {
    startNewHand();
  }, [startNewHand]);

  return (
    <AppContainer>
      <h1>Blackjack Strategy Trainer</h1>
      <GameContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ToggleContainer>
          <ToggleLabel>
            Ace Mode
            <ToggleSwitch
              isActive={gameState.aceMode}
              onClick={() => setGameState(prev => ({ ...prev, aceMode: !prev.aceMode }))}
            />
          </ToggleLabel>
        </ToggleContainer>

        <h2>Dealer's Cards</h2>
        <DealerCardContainer>
          {gameState.dealerCards.map((card, index) => (
            <CardElement
              key={index}
              isRed={card.suit === '♥' || card.suit === '♦'}
              isHidden={index === 0 && !gameState.showDealerCards}
              isDealer
              index={index}
              whileHover={{ scale: 1.05 }}
            >
              {index === 0 && !gameState.showDealerCards ? '?' : `${card.value}${card.suit}`}
            </CardElement>
          ))}
        </DealerCardContainer>

        <h2>Your Cards</h2>
        <CardContainer>
          {gameState.playerCards.map((card, index) => (
            <CardElement
              key={index}
              isRed={card.suit === '♥' || card.suit === '♦'}
              whileHover={{ scale: 1.05 }}
            >
              {card.value}{card.suit}
            </CardElement>
          ))}
        </CardContainer>

        <ButtonContainer>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDecision('hit')}
            disabled={gameState.showFeedback}
          >
            Hit
          </Button>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDecision('stand')}
            disabled={gameState.showFeedback}
          >
            Stand
          </Button>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDecision('double')}
            disabled={gameState.showFeedback}
          >
            Double
          </Button>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDecision('split')}
            disabled={gameState.showFeedback}
          >
            Split
          </Button>
        </ButtonContainer>

        <AnimatePresence>
          {gameState.showFeedback && (
            <FeedbackMessage
              isCorrect={gameState.lastDecision === gameState.lastCorrectDecision}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {gameState.lastDecision === gameState.lastCorrectDecision
                ? 'Correct! Well done!'
                : `Incorrect. The correct decision was ${gameState.lastCorrectDecision}.`}
            </FeedbackMessage>
          )}
        </AnimatePresence>

        <StatsContainer>
          <p>Score: {gameState.score}</p>
          <p>Correct Decisions: {gameState.correctDecisions}/{gameState.totalDecisions}</p>
          <p>Accuracy: {gameState.totalDecisions > 0 
            ? ((gameState.correctDecisions / gameState.totalDecisions) * 100).toFixed(1) 
            : 0}%</p>
        </StatsContainer>

        <ButtonContainer>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewHand}
            disabled={gameState.showFeedback}
          >
            New Hand
          </Button>
        </ButtonContainer>
      </GameContainer>
    </AppContainer>
  );
}

export default App;
