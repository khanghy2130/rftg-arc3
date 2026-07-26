<script lang="ts">
  import type { Card } from "$lib";
  import { allCards } from "$lib/cardPool";
  import { scale, fade } from "svelte/transition";

  let modalOpen = $state(false);
  let pickedStartWorlds: Card[] = $state([]);
  let startingHand: Card[] = $state([]);
  let counter = $state(0);

  const blueNames = [
    "terraforming surveyors",
    "industrial robots",
    "terraforming colonists",
    "old earth",
    "star nomad trading post",
    "starry rift pioneers",
    "gateway station",
    "earth's lost colony",
    "alpha centauri",
    "frontier miners",
    "terraforming bio-engineers",
  ];
  const redNames = [
    "rebel cadre",
    "alien first contact team",
    "anti-xeno resistance",
    "defense systems, inc.",
    "new sparta",
    "star nomad raiders",
    "anti-xeno defense post",
    "imperium blaster gem prospectors",
    "abandoned mine squatters",
    "galactic trade emissaries",
    "epsilon eridani",
  ];

  const cardPool = allCards.filter((card) => {
    return (
      card.world === undefined ||
      (card.world.type !== "FAR" && card.world.type !== "NEAR")
    );
  });
  const blueStartWorldPool = cardPool.filter(
    (card) => card.world?.type === "START_BLUE",
  );
  const redStartWorldPool = cardPool.filter(
    (card) => card.world?.type === "START_RED",
  );

  function generateStartingHand() {
    counter++;
    const pickedRedName = redNames[Math.floor(Math.random() * redNames.length)];
    const pickedBlueName =
      blueNames[Math.floor(Math.random() * blueNames.length)];

    const redCard = redStartWorldPool.find(
      (card) => card.name.toLowerCase() === pickedRedName,
    );
    const blueCard = blueStartWorldPool.find(
      (card) => card.name.toLowerCase() === pickedBlueName,
    );

    // generate 6 unique random cards from the card pool, excluding the picked start worlds
    let allowNonWorldDuplicate = true; // Set this to false after getting one non world duplicate
    const _startingHand: Card[] = [];
    while (_startingHand.length < 6) {
      const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
      if (_startingHand.includes(randomCard)) {
        // if is a development (but not 6 or 9 cost) then allow*
        if (
          randomCard.world === undefined &&
          randomCard.cost !== 6 &&
          randomCard.cost !== 9 &&
          allowNonWorldDuplicate
        ) {
          allowNonWorldDuplicate = false;
        } else continue;
      } else if (randomCard === redCard || randomCard === blueCard) continue;
      _startingHand.push(randomCard);
    }
    pickedStartWorlds = [redCard!, blueCard!];
    startingHand = _startingHand;
  }
</script>

<button
  onclick={() => {
    modalOpen = true;
    generateStartingHand();
  }}>Generate Starting Hand</button
>
{#if modalOpen}
  <div class="modal" transition:fade={{ duration: 200 }}>
    <div class="modal-content">
      <div class="button-row">
        <button onclick={generateStartingHand}>Generate new hand</button>
        <button onclick={() => (modalOpen = false)}>Exit</button>
      </div>

      <div class="card-stage">
        <div class="world-row">
          {#each pickedStartWorlds as card, index (card.src + "-" + index + counter)}
            <img
              class="card-image"
              src={card.src}
              alt={card.name}
              title={card.name}
              in:scale={{ delay: index * 80, duration: 300 }}
            />
          {/each}
        </div>

        <div class="hand-grid">
          {#each startingHand as card, index (card.src + "-" + index + counter)}
            <img
              class="card-image"
              src={card.src}
              alt={card.name}
              title={card.name}
              in:scale={{ delay: (index + 1) * 80, duration: 300 }}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  button {
    font-size: 20px;
    padding: 8px 16px;
    margin: 20px 0;
    margin-right: 20px;
    background-color: #aa7013;
    background: linear-gradient(90deg, #aa7013 0%, #c68a2a 35%, #905e0c 100%);
    color: white;
    border: none;
    border-radius: 5px;
    transition: transform 0.05s linear;
  }

  button:hover {
    cursor: pointer;
  }
  button:active {
    transform: scale(0.92);
  }

  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 16px;
  }

  .modal-content {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .world-row,
  .hand-grid {
    display: grid;
    justify-content: center;
    gap: 12px;
  }

  .world-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .hand-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .card-image {
    width: 100%;
    max-width: 150px;
    height: auto;
    display: block;
  }

  .button-row {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .button-row button {
    margin: 10px 0;
  }

  @media (max-width: 768px) {
    button {
      font-size: 14px;
      padding: 6px 12px;
    }
  }
</style>
