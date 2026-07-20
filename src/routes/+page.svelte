<script lang="ts">
  import { allCards } from "$lib/cardPool";
  import type { Card, World, Power, Keyword } from "$lib";

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
        "CHROMOSOME",
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
      label: "Color",
      tags: ["GRAY", "BLUE", "BROWN", "GREEN", "YELLOW"],
    },
    {
      label: "Economy",
      tags: ["Production", "Windfall"],
    },
  ];

  function toggleTag(tag: string) {
    if (activeTags.includes(tag)) {
      activeTags = activeTags.filter((value) => value !== tag);
      return;
    }

    activeTags = [...activeTags, tag];
  }
</script>

<div class="container">
  <h1>Card Library - Race for the Galaxy Arc 3</h1>
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
      <label for="hideDevDuplicates">Hide development duplicates</label>
    </div>
  </div>

  <div class="active-tags-section">
    <div class="active-tags-label">Active Filters (click to remove)</div>
    {#if activeTags.length > 0}
      <div class="tag-row">
        {#each activeTags as tag}
          <button
            type="button"
            class="active-tag"
            onclick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        {/each}
      </div>
    {:else}
      <div class="no-active-tags">No filters.</div>
    {/if}
  </div>

  <div class="results-section"></div>
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

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
  }

  a {
    color: #f7bb59;
    text-decoration: none;
  }

  h1 {
    color: #f5f7ff;
    margin-bottom: 18px;
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
    width: 16px;
    height: 16px;
  }

  .filters-section {
    display: grid;
    gap: 18px;
    margin-bottom: 24px;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  }

  .filter-group,
  .active-tags-section {
    background: #161824;
    border: 1px solid #2f3240;
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
  }

  .active-tag {
    background: #163b9a;
    color: #ffffff;
    border-color: #3b59cc;
  }

  button {
    border: 1px solid #3b4052;
    background: #1f2432;
    color: #e7e9ee;
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 1rem;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  button:hover {
    border-color: #163b9a;
    background: #2b2f44;
  }

  button.selected {
    background: #163b9a;
    color: #ffffff;
    border-color: #3b59cc;
  }

  .results-section {
    min-height: 120px;
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
