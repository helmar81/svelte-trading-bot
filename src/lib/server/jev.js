// src/lib/server/jev.js
import { env } from '$env/dynamic/private';

/**
 * Analyzes BTC/USD market context using TypeSafe AI Jev
 * @param {{ price: number; high: number; low: number; volume?: number }} marketContext
 * @returns {Promise<{ signal: 'LONG' | 'SHORT' | 'NEUTRAL'; confidence: number; reasoning: string; stopLoss: number; takeProfit: number }>}
 */
export async function analyzeEntryWithJev(marketContext) {
  const apiKey = env.JEV_API_KEY || '';

  if (!apiKey) {
    // Mock response when JEV_API_KEY is not configured in .env
    return {
      signal: 'LONG',
      confidence: 0.85,
      reasoning: 'Price holding above 24h average volume range.',
      stopLoss: marketContext.price * 0.98,
      takeProfit: marketContext.price * 1.05
    };
  }

  const state = `Analyze market conditions for BTC/USD:
- Current Price: $${marketContext.price}
- High: $${marketContext.high}
- Low: $${marketContext.low}`;

  const response = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      state,
      model: 'jev-latest',
      questions: {
        signal: {
          type: 'choice',
          criteria: {
            'LONG': 'Buy signal',
            'SHORT': 'Sell signal',
            'NEUTRAL': 'Hold signal'
          },
          instructions: 'Based on the market context, determine the optimal trading signal.'
        }
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Jev API Error Body:', errorBody);
    throw new Error(`Jev API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const signalChoice = result.answers.signal;
  const signal = signalChoice.choice;
  const confidence = signalChoice.confidence;
  
  // System One evaluates probabilities rather than text. 
  // Synthesize reasoning and target levels based on the returned structured decision.
  let reasoning = `System One returned ${signal} signal with ${(confidence * 100).toFixed(1)}% confidence based on current market state.`;
  
  let stopLoss = marketContext.price;
  let takeProfit = marketContext.price;
  
  if (signal === 'LONG') {
    stopLoss = marketContext.price * 0.98;
    takeProfit = marketContext.price * 1.05;
  } else if (signal === 'SHORT') {
    stopLoss = marketContext.price * 1.02;
    takeProfit = marketContext.price * 0.95;
  }

  return {
    signal,
    confidence,
    reasoning,
    stopLoss,
    takeProfit
  };
}
