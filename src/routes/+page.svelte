<script lang="ts">
  import { allCards } from "$lib/cardPool";
  import type { Card, World, Power, Keyword } from "$lib";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  let columnsPerRow = $state(4);
  let searchTerm = $state("");
  let activeTags: string[] = $state([]);

  const filterGroups = [
    {
      label: "Card Type",
      tags: ["Development", "Non-military World", "Military World"],
    },
    {
      label: "World Type",
      tags: ["Near Frontier", "Far Frontier", "Start Worlds", "Other Worlds"],
    },
    {
      label: "Cost / Defense",
      tags: Array.from({ length: 11 }, (_, index) => `${"$" + index}`),
    },
    {
      label: "VP",
      tags: Array.from({ length: 11 }, (_, index) => `${"VP: " + (index - 1)}`),
    },
    {
      label: "Keywords",
      tags: [
        "CHROMO",
        "ANTI-XENO",
        "XENO",
        "UPLIFT",
        "REBEL",
        "IMPERIUM",
        "ALIEN",
        "TERRAFORMING",
      ],
    },
    {
      label: "Phase",
      tags: ["I", "II", "III", "$", "IV", "V"],
    },
    {
      label: "Good Color",
      tags: ["gray", "blue", "brown", "green", "yellow"],
    },
    {
      label: "Production / Windfall",
      tags: ["Production", "Windfall"],
    },
  ];

  let results: Card[] = $derived.by(() => {
    if (activeTags.length === 0 && searchTerm.trim() === "") {
      return allCards;
    }

    const filteredCards = allCards.filter((card) => {
      const matchesSearchTerm = card.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearchTerm) return false;

      ////// check each group. if has none in group then pass. else only matching tag(s) in this group can pass

      // Card Type

      /*
      return activeTags.every((tag) => {
        // Card type tags
        if (tag === "Development") {
          return card.world === undefined;
        }
        if (tag === "Non-military World") {
          return card.world?.isMilitary === undefined;
        }
        if (tag === "Military World") {
          return card.world?.isMilitary === true;
        }

        // VP and cost tags
        if (tag.startsWith("VP: ")) {
          const vpValue = parseInt(tag.split(": ")[1]);
          return card.vp === vpValue;
        }
        if (tag.startsWith("$")) {
          const costValue = parseInt(tag.slice(1));
          return card.cost === costValue;
        }

        // Production / Windfall tags
        if (tag === "Production") {
          return card.world?.isWindfall === undefined;
        }
        if (tag === "Windfall") {
          return card.world?.isWindfall === true;
        }

        // World type tags
        if (tag === "Near Frontier") {
          return card.world?.type === "NEAR";
        }
        if (tag === "Far Frontier") {
          return card.world?.type === "FAR";
        }
        if (tag === "Start Worlds") {
          return (
            card.world?.type === "START_BLUE" ||
            card.world?.type === "START_RED"
          );
        }
        if (tag === "Other Worlds") {
          return card.world?.type === undefined;
        }

        // Good color tags
        if (tag === "gray") {
          return card.world?.good === undefined;
        }
        if (tag === "blue") {
          return card.world?.good === "NOVELTY";
        }
        if (tag === "brown") {
          return card.world?.good === "RARE";
        }
        if (tag === "green") {
          return card.world?.good === "GENE";
        }
        if (tag === "yellow") {
          return card.world?.good === "ALIEN";
        }

        // Keyword tags
        return card.keywords?.includes(tag as Keyword);
      });
      */
    });

    // add a copy of each development card, except if the cost is 6 or 9
    for (let i = filteredCards.length - 1; i >= 0; i--) {
      const card = filteredCards[i];
      if (card.world === undefined && card.cost !== 6 && card.cost !== 9) {
        filteredCards.splice(i, 0, card);
      }
    }

    return filteredCards;
  });

  function toggleTag(tag: string) {
    if (activeTags.includes(tag)) {
      activeTags = activeTags.filter((value) => value !== tag);
      return;
    }

    activeTags = [...activeTags, tag];
  }
</script>

<div class="container">
  <h1>Card Gallery - Race for the Galaxy Arc 3</h1>
  <p>
    Fan-made card library for <a
      href="https://boardgamegeek.com/boardgame/28143"
      target="_blank">Race for the Galaxy 2nd Edition</a
    >, a card game published by Rio Grande Games, including the Arc 3
    expansions:
    <a
      href="https://boardgamegeek.com/boardgameexpansion/161599/"
      target="_blank">Xeno Invasion</a
    >
    and
    <a href="https://boardgamegeek.com/boardgame/394555" target="_blank"
      >Xeno Counterstrike</a
    >.
  </p>
  <p>
    Most data and images were taken from <a
      href="https://galactic-survey.gitlab.io/rftgpics"
      target="_blank">Galactic Survey RFTGPics</a
    >.
  </p>

  <div class="filters-section">
    {#each filterGroups as group}
      <div class="filter-group">
        <div class="filter-group-label">{group.label}</div>
        <div class="tag-row">
          {#each group.tags as tag}
            <button
              type="button"
              class:selected={activeTags.includes(tag)}
              onclick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="search-section">
    <input
      type="text"
      placeholder="Filter by name"
      bind:value={searchTerm}
      class="search-input"
    />
    <div>
      <input type="checkbox" id="hideDevDuplicates" />
      <label for="hideDevDuplicates" style="cursor: pointer;"
        >Hide development duplicates</label
      >
    </div>
  </div>

  <div class="active-tags-section">
    <div class="active-tags-label">Active Filters (click to remove)</div>

    <div class="tag-row">
      {#if activeTags.length === 0}
        <p class="no-active-tags">No filters.</p>
      {/if}
      {#each activeTags as tag (tag)}
        <button
          animate:flip={{ duration: 300 }}
          in:fly={{ y: 30, duration: 300 }}
          type="button"
          class="active-tag"
          onclick={() => toggleTag(tag)}
        >
          {tag}
        </button>
      {/each}
    </div>
  </div>

  <div class="slider-section">
    <label for="columnsSlider"
      >Columns per row: <span class="slider-value">{columnsPerRow}</span></label
    >
    <input
      id="columnsSlider"
      type="range"
      min="3"
      max="6"
      bind:value={columnsPerRow}
      class="columns-slider"
    />
  </div>

  <div class="results-section" style="--columns: {columnsPerRow}">
    {#each results as card, index (index)}
      <img src={card.src} alt={card.name} title={card.name} />
    {/each}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background-color: #0f1117;
    color: #e7e9ee;
    font-size: 24px;
  }

  * {
    margin: 0;
    padding: 0;
  }

  :root {
    --primary-color: #124ba8;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
  }

  a {
    color: #f7bb59;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }

  h1 {
    color: #f5f7ff;
    margin-bottom: 18px;
    font-size: 2rem;
  }

  .search-section {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
  }

  .search-input {
    width: 70vw;
    max-width: 480px;
    padding: 10px 14px;
    border: 1px solid #2f3240;
    border-radius: 8px;
    background: #161824;
    color: #e7e9ee;
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .search-input::placeholder {
    color: #8f96ab;
  }

  .search-section label {
    font-size: 1.25rem;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .filters-section {
    display: grid;
    gap: 18px;
    margin-top: 24px;
    margin-bottom: 24px;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }

  .filter-group,
  .active-tags-section {
    background: #161824;
    border-radius: 12px;
    padding: 14px;
  }

  .filter-group-label,
  .active-tags-label {
    font-weight: 700;
    margin-bottom: 10px;
    color: #f5f7ff;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .no-active-tags {
    color: #8f96ab;
    font-style: italic;
    font-size: 1.15rem;
  }

  .active-tag {
    background: var(--primary-color);
    color: #ffffff;
    border-color: rgb(165, 165, 165);
  }
  .active-tag:hover {
    text-decoration: line-through;
  }

  button {
    border: none;
    background: #1f2432;
    color: #e7e9ee;
    border-radius: 20px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 1.15rem;
    transition:
      transform 0.06s linear,
      background-color 0.1s ease,
      border-color 0.1s ease,
      color 0.1s ease;
  }

  button:hover {
    background: #2b2f44;
  }

  button.selected {
    background: var(--primary-color);
    color: #ffffff;
    border-color: rgb(165, 165, 165);
  }

  button:active {
    transform: scale(0.9);
  }

  .results-section {
    display: grid;
    grid-template-columns: repeat(var(--columns, 4), 1fr);
  }

  .results-section img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  .slider-section {
    margin-top: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .slider-section label {
    font-size: 1.15rem;
    font-weight: 500;
  }

  .slider-value {
    font-weight: 700;
    color: #f7bb59;
  }

  .columns-slider {
    width: 200px;
    height: 6px;
    border-radius: 3px;
    background: #2f3240;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .columns-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #f7bb59;
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .columns-slider::-webkit-slider-thumb:hover {
    background: #ffcc7a;
  }

  .columns-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #f7bb59;
    cursor: pointer;
    border: none;
    transition: background 0.1s ease;
  }

  .columns-slider::-moz-range-thumb:hover {
    background: #ffcc7a;
  }

  @media (max-width: 768px) {
    .container {
      padding: 16px;
    }

    .filters-section {
      grid-template-columns: 1fr;
    }
  }
</style>
