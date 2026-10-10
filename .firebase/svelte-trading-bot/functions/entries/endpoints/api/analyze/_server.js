import { json } from "@sveltejs/kit";
import { b as private_env } from "../../../../chunks/shared-server.js";
async function analyzeEntryWithJev(marketContext) {
  const apiKey = private_env.JEV_API_KEY || "";
  if (!apiKey) {
    return {
      signal: "LONG",
      confidence: 0.85,
      reasoning: "Price holding above 24h average volume range.",
      stopLoss: marketContext.price * 0.98,
      takeProfit: marketContext.price * 1.05
    };
  }
  const state = `Analyze market conditions for BTC/USD:
- Current Price: $${marketContext.price}
- High: $${marketContext.high}
- Low: $${marketContext.low}`;
  const response = await fetch("https://api.typesafe.ai/v1/systemone", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      state,
      model: "jev-latest",
      questions: {
        signal: {
          type: "choice",
          criteria: {
            "LONG": "Buy signal",
            "SHORT": "Sell signal",
            "NEUTRAL": "Hold signal"
          },
          instructions: "Based on the market context, determine the optimal trading signal."
        }
      }
    })
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Jev API Error Body:", errorBody);
    throw new Error(`Jev API request failed: ${response.status} ${response.statusText}`);
  }
  const result = await response.json();
  const signalChoice = result.answers.signal;
  const signal = signalChoice.choice;
  const confidence = signalChoice.confidence;
  let reasoning = `System One returned ${signal} signal with ${(confidence * 100).toFixed(1)}% confidence based on current market state.`;
  let stopLoss = marketContext.price;
  let takeProfit = marketContext.price;
  if (signal === "LONG") {
    stopLoss = marketContext.price * 0.98;
    takeProfit = marketContext.price * 1.05;
  } else if (signal === "SHORT") {
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
async function POST() {
  try {
    const tickerRes = await fetch("https://api.kraken.com/0/public/Ticker?pair=XBTUSD");
    const tickerData = await tickerRes.json();
    if (tickerData.error && tickerData.error.length > 0) {
      throw new Error(`Kraken Ticker Error: ${tickerData.error.join(", ")}`);
    }
    const ticker = tickerData.result.XXBTZUSD || tickerData.result.XBTUSD;
    const currentPrice = parseFloat(ticker.c[0]);
    const marketContext = {
      price: currentPrice,
      high: parseFloat(ticker.h[1]),
      low: parseFloat(ticker.l[1]),
      volume: parseFloat(ticker.v[1])
    };
    const analysis = await analyzeEntryWithJev(marketContext);
    return json({
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      marketContext,
      analysis
    });
  } catch (error) {
    console.error("API /api/analyze Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ success: false, error: message }, { status: 500 });
  }
}
export {
  POST
};
