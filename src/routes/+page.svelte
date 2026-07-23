<script lang="ts">
  import { allCards } from "$lib/cardPool";
  import type { Card, World, Power, Keyword } from "$lib";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  let columnsPerRow = $state(8);
  let searchTerm = $state("");
  let showDevDuplicates = $state(false);
  let activeTags: string[] = $state([]);

  const filterGroups = {
    Set: ["Base", "Xeno Invasion", "Xeno Counterstrike"],
    "Card Type": ["Development", "Non-military World", "Military World"],
    Keywords: [
      "CHROMO",
      "ANTI-XENO",
      "XENO",
      "UPLIFT",
      "REBEL",
      "IMPERIUM",
      "ALIEN",
      "TERRAFORMING",
    ],
    "World Type": [
      "Near Frontier",
      "Far Frontier",
      "Start Worlds",
      "Non-frontier Worlds",
    ],
    "Cost / Defense": Array.from(
      { length: 11 },
      (_, index) => `${"$" + index}`,
    ),
    VP: [
      ...Array.from({ length: 11 }, (_, index) => `${"VP: " + (index - 1)}`),
      "VP: ?",
    ],
    "Phase Power": ["I", "II", "III", "$", "IV", "V"],
    "Good Color": ["gray", "blue", "brown", "green", "yellow"],
    "Production / Windfall": ["Production", "Windfall"],
  };

  let results: Card[] = $derived.by(() => {
    if (activeTags.length === 0 && searchTerm.trim() === "") {
      const allCardsCopy = [...allCards];
      addDevDuplicates(allCardsCopy);
      return allCardsCopy;
    }

    const filteredCards = allCards.filter((card) => {
      const matchesSearchTerm = card.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearchTerm) return false;

      // Set
      const activeSetTags = activeTags.filter((tag) =>
        filterGroups["Set"].includes(tag),
      );
      if (activeSetTags.length > 0) {
        const matchesSetType = activeSetTags.some((tag) => {
          if (tag === "Base") {
            return card.set === undefined;
          }
          if (tag === "Xeno Invasion") {
            return card.set === "xi";
          }
          if (tag === "Xeno Counterstrike") {
            return card.set === "xc";
          }
        });
        if (!matchesSetType) return false;
      }

      // Card Type
      const activeCardTypeTags = activeTags.filter((tag) =>
        filterGroups["Card Type"].includes(tag),
      );
      if (activeCardTypeTags.length > 0) {
        const matchesCardType = activeCardTypeTags.some((tag) => {
          if (tag === "Development") {
            return card.world === undefined;
          }
          if (card.world === undefined) return false; // this card is not a world
          if (tag === "Non-military World") {
            return card.world?.isMilitary === undefined;
          }
          if (tag === "Military World") {
            return card.world?.isMilitary === true;
          }
        });
        if (!matchesCardType) return false;
      }

      // World Type
      const activeWorldTypeTags = activeTags.filter((tag) =>
        filterGroups["World Type"].includes(tag),
      );
      if (activeWorldTypeTags.length > 0) {
        // must be world
        // if (card.world === undefined) return false;
        const matchesWorldType = activeWorldTypeTags.some((tag) => {
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
          if (tag === "Non-frontier Worlds") {
            return card.world?.type === undefined;
          }
        });
        if (!matchesWorldType) return false;
      }

      // Cost / Defense
      const activeCostTags = activeTags.filter((tag) =>
        filterGroups["Cost / Defense"].includes(tag),
      );
      if (activeCostTags.length > 0) {
        const matchesCost = activeCostTags.some((tag) => {
          const costValue = parseInt(tag.slice(1));
          return card.cost === costValue;
        });
        if (!matchesCost) return false;
      }

      // VP
      const activeVPTags = activeTags.filter((tag) =>
        filterGroups["VP"].includes(tag),
      );
      if (activeVPTags.length > 0) {
        const matchesVP = activeVPTags.some((tag) => {
          if (tag === "VP: ?") {
            return card.vp === "?";
          }
          return card.vp === parseInt(tag.slice(4));
        });
        if (!matchesVP) return false;
      }

      // Keywords
      const activeKeywordTags = activeTags.filter((tag) =>
        filterGroups["Keywords"].includes(tag),
      );
      if (activeKeywordTags.length > 0) {
        if (!card.keywords) return false; // card has no keywords
        const matchesKeyword = activeKeywordTags.some((tag) => {
          return card.keywords?.includes(tag as Keyword);
        });
        if (!matchesKeyword) return false;
      }

      // Phase with powers
      const activePhaseTags = activeTags.filter((tag) =>
        filterGroups["Phase Power"].includes(tag),
      );
      if (activePhaseTags.length > 0) {
        const matchesPhase = activePhaseTags.some((tag) => {
          return card.powers.includes(tag as Power);
        });
        if (!matchesPhase) return false;
      }

      // Good Color
      const activeGoodColorTags = activeTags.filter((tag) =>
        filterGroups["Good Color"].includes(tag),
      );
      if (activeGoodColorTags.length > 0) {
        // must be world
        if (card.world === undefined) return false;
        const matchesGoodColor = activeGoodColorTags.some((tag) => {
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
        });
        if (!matchesGoodColor) return false;
      }

      // Production / Windfall
      const activeProductionWindfallTags = activeTags.filter((tag) =>
        filterGroups["Production / Windfall"].includes(tag),
      );
      if (activeProductionWindfallTags.length > 0) {
        if (card.world?.good === undefined) return false; // must have good to be production or windfall
        const matchesProductionWindfall = activeProductionWindfallTags.some(
          (tag) => {
            if (tag === "Production") {
              return card.world?.isWindfall === undefined;
            }
            if (tag === "Windfall") {
              return card.world?.isWindfall === true;
            }
          },
        );
        if (!matchesProductionWindfall) return false;
      }

      return true;
    });

    addDevDuplicates(filteredCards);
    return filteredCards;
  });

  function addDevDuplicates(filteredCards: Card[]) {
    // add a copy of each development card, except for the ones with cost of 6 or 9
    if (!showDevDuplicates) return;
    for (let i = filteredCards.length - 1; i >= 0; i--) {
      const card = filteredCards[i];
      if (card.world === undefined && card.cost !== 6 && card.cost !== 9) {
        filteredCards.splice(i, 0, card);
      }
    }
  }

  function toggleTag(tag: string) {
    if (activeTags.includes(tag)) {
      activeTags = activeTags.filter((value) => value !== tag);
      return;
    }
    activeTags = [...activeTags, tag];
  }
</script>

<div class="container">
  <h1 id="PageTitle">Card Gallery - Race for the Galaxy Arc 3</h1>
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
    {#each Object.keys(filterGroups) as (keyof typeof filterGroups)[] as groupName}
      <div class="filter-group">
        <div class="filter-group-label">{groupName}</div>
        <div class="tag-row">
          {#each filterGroups[groupName] as tag}
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

  <div class="search-section">
    <input
      type="text"
      placeholder="Filter by name"
      bind:value={searchTerm}
      class="search-input"
    />
    <div>
      <input
        type="checkbox"
        id="showDevDuplicates"
        bind:checked={showDevDuplicates}
      />
      <label for="showDevDuplicates" style="cursor: pointer;"
        >Show development duplicates</label
      >
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
      max="8"
      bind:value={columnsPerRow}
      class="columns-slider"
    />
  </div>

  <div>
    <p class="result-count">{results.length} results</p>
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
    margin-top: 24px;
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

  .result-count {
    margin-bottom: 12px;
    font-size: 1.15rem;
    font-style: italic;
    width: 100%;
    text-align: center;
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
      padding: 12px;
      font-size: 16px;
    }

    #PageTitle {
      font-size: 1.5rem;
    }

    .filters-section {
      grid-template-columns: 1fr;
    }

    button {
      font-size: 0.875rem;
    }
  }
</style>
