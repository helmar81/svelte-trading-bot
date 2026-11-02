<script lang="ts">
  let agentOutput: string = '';
  let analyzingAgents = false;
  let agentError = '';

  async function triggerAgentDebate() {
    analyzingAgents = true;
    agentError = '';
    agentOutput = '';

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Analyze current Bitcoin market setup. Provide insights from a Bullish Trader, a Bearish Skeptic, and a Risk Manager.'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch agent analysis.');
      }

      agentOutput = data.text;
    } catch (err: any) {
      agentError = err.message || 'Something went wrong with the agent discussion.';
    } finally {
      analyzingAgents = false;
    }
  }
</script>

<div class="agent-section">
  <button class="agent-btn" type="button" onclick={triggerAgentDebate} disabled={analyzingAgents}>
    {analyzingAgents ? 'Agents Discussing Setup...' : 'Run Agent Analysis'}
  </button>

  {#if agentError}
    <p class="analysis-error" role="alert">{agentError}</p>
  {/if}

  {#if agentOutput}
    <div class="analysis-box agent-output-box">
      <h3>🤖 Multi-Agent Setup Discussion</h3>
      <p class="agent-text">{agentOutput}</p>
    </div>
  {/if}
</div>