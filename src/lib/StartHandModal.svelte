<script lang="ts">
  import type { Card } from "$lib";
  import { allCards } from "$lib/cardPool";
  import { fade } from "svelte/transition";

  let modalOpen = $state(false);
  let pickedStartWorlds: Card[] = $state([]);
  let startingHand: Card[] = $state([]);
  let counter = $state(0);

  const redNames = [
    "Rebel Cadre",
    "Alien First Contact Team",
    "anti-xeno resistance",
    "defense systems, inc.",
    "New Sparta",
    "Star Nomad Raiders",
    "Anti-Xeno Defense Post",
    "imperium blaster gem prospectors",
    "Abandoned Mine Squatters",
    "Galactic Trade Emissaries",
    "Epsilon Eridani",
  ];

  const blueNames = [
    "Terraforming Surveyors",
    "Industrial Robots",
    "Terraforming Colonists",
    "Old Earth",
    "star nomad trading post",
    "Starry Rift Pioneers",
    "Gateway Station",
    "Earth's Lost Colony",
    "Alpha Centauri",
    "frontier miners",
    "terraforming bio-engineers",
  ];

  const cardPool = allCards.filter((card) => {
    return (
      card.world === undefined ||
      (card.world.type !== "FAR" && card.world.type !== "NEAR")
    );
  });

  function generateStartingHand() {
    counter++;
    const pickedRedName = redNames[Math.floor(Math.random() * redNames.length)];
    const pickedBlueName =
      blueNames[Math.floor(Math.random() * blueNames.length)];

    const redCard = cardPool.find((card) => card.name === pickedRedName);
    const blueCard = cardPool.find((card) => card.name === pickedBlueName);

    // grenerate 6 unique random cards from the card pool, excluding the picked start worlds
    let allowNonWorldDuplicate = true; // Set this to false after getting one non world duplicate
    const _startingHand: Card[] = [];
    while (_startingHand.length < 6) {
      const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
      if (_startingHand.includes(randomCard)) {
        // if is a development then allow*
        if (randomCard.world === undefined && allowNonWorldDuplicate) {
          allowNonWorldDuplicate = false;
        } else continue;
      }
      if (randomCard === redCard || randomCard === blueCard) continue;
      _startingHand.push(randomCard);
    }
    pickedStartWorlds = [redCard!, blueCard!];
    startingHand = _startingHand;
  }
</script>

<button
  id="open-modal-button"
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
              in:fade={{ duration: 150 }}
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
              in:fade={{ duration: 150 }}
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
    background-color: #aa7013;
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s;
  }

  button:hover {
    cursor: pointer;
    background-color: #ca881d;
  }

  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 24px;
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
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  }

  .button-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    button {
      font-size: 14px;
      padding: 6px 12px;
    }
  }
</style>
