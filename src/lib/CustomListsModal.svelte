<script lang="ts">
  import type { Card, CustomList } from "$lib";
  import { allCards } from "$lib/cardPool";
  import { fade } from "svelte/transition";

  let {
    customLists = $bindable(),
    open = $bindable(),
    selectedCard,
  }: {
    customLists: CustomList[];
    open: boolean;
    selectedCard: Card | null;
  } = $props();

  let viewIndex: number | null = $state(null); // when viewing a specific list
  let columnsPerRow = $state(5);
  let copiedList: string | null = $state(null);

  function save() {
    try {
      localStorage.setItem("customLists", JSON.stringify(customLists));
    } catch (e) {
      console.error("Failed to save customLists", e);
    }
  }

  function createNewList() {
    let name = prompt("New list name:", "New List");
    if (!name) return;
    if (customLists.some((l) => l.title === name)) {
      alert("A list with that name already exists");
      return;
    }
    customLists = [...customLists, { title: name, cardNames: [] }];
    save();
  }

  function toggleCardInList(index: number, cardName: string) {
    const list = customLists[index];
    if (!list) return;
    const already = list.cardNames.includes(cardName);
    if (already) {
      list.cardNames = list.cardNames.filter((n) => n !== cardName);
    } else {
      list.cardNames = [...list.cardNames, cardName];
    }
    // ensure unique
    list.cardNames = Array.from(new Set(list.cardNames));
    customLists = [
      ...customLists.slice(0, index),
      list,
      ...customLists.slice(index + 1),
    ];
    save();
  }

  function renameList(index: number) {
    const newName = prompt("Rename list:", customLists[index].title);
    if (!newName) return;
    if (customLists.some((l, i) => l.title === newName && i !== index)) {
      alert("Another list already has that name");
      return;
    }
    customLists[index].title = newName;
    customLists = [...customLists];
    save();
  }

  function copyList(index: number) {
    const list = customLists[index];
    copiedList = list.cardNames.join("; ").toLowerCase();
    // copy to clipboard if available
    try {
      navigator.clipboard?.writeText(copiedList);
      alert("List is copied");
    } catch {
      alert("Error while copying data");
    }
  }

  function pasteList() {
    const rest = prompt("Paste list data here") || "";
    let cardNames = rest
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    cardNames = Array.from(new Set(cardNames));
    cardNames = cardNames.filter((cn) => {
      return (
        allCards.find((card) => {
          return card.name.toLowerCase() === cn.toLowerCase();
        }) !== undefined
      );
    });
    if (cardNames.length === 0) return alert("No matching cards found");

    const title = "New List";
    let newTitle = title;
    let suffix = 1;
    while (customLists.some((l) => l.title === newTitle)) {
      newTitle = `${title} ${suffix++}`;
    }
    customLists = [...customLists, { title: newTitle, cardNames: cardNames }];
    save();
  }

  function removeList(index: number) {
    if (!confirm(`Delete list '${customLists[index].title}'?`)) return;
    customLists = [
      ...customLists.slice(0, index),
      ...customLists.slice(index + 1),
    ];
    save();
  }

  function openList(index: number) {
    viewIndex = index;
  }

  function close() {
    viewIndex = null;
    open = false;
  }

  function goBack() {
    viewIndex = null;
  }

  function removeCardFromViewedList(cardName: string) {
    if (viewIndex === null) return;
    const list = customLists[viewIndex];
    list.cardNames = list.cardNames.filter((n) => n !== cardName);
    customLists = [...customLists];
    save();
  }

  // helpers to map names -> Card (for images)
  function cardByName(name: string): Card | undefined {
    return allCards.find(
      (c) => c.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
  }
</script>

<button
  id="open-modal-button"
  onclick={() => {
    open = true;
    selectedCard = null;
  }}>Custom Lists</button
>
{#if open}
  <div class="modal" transition:fade={{ duration: 150 }}>
    <div class="modal-content">
      <div class="modal-top-row">
        <div class="spacer">
          {#if viewIndex !== null}
            {customLists[viewIndex].title}
          {:else if selectedCard}
            Adding {selectedCard.name.toUpperCase()}
          {:else}
            Custom Lists
          {/if}
        </div>
        {#if viewIndex !== null}
          <button class="close-btn" onclick={goBack}>Go back</button>
        {:else}
          <button class="close-btn" onclick={close}>Exit</button>
        {/if}
      </div>

      {#if viewIndex === null}
        {#if selectedCard}
          <div class="adding-preview-container">
            <img
              src={selectedCard.src}
              alt={selectedCard.name}
              title={selectedCard.name}
            />
          </div>
        {/if}
        <div class="modal-actions">
          <button onclick={createNewList}>Create New List</button>
          <button onclick={pasteList}>Paste List Data</button>
        </div>

        <div class="lists-grid">
          {#each customLists as list, index}
            <div class="list-card">
              <div class="list-header">
                <h5>{list.title}</h5>
              </div>
              <div class="list-actions">
                <button onclick={() => openList(index)}>View</button>
                <button onclick={() => renameList(index)}>Rename</button>
                <button onclick={() => copyList(index)}>Copy</button>
                <button onclick={() => removeList(index)}>Remove</button>
              </div>
              <div class="mini-list-grid">
                {#each list.cardNames as name, idx (name + "-" + idx)}
                  {#if cardByName(name)}
                    <div class="card-container">
                      <img
                        src={cardByName(name)?.src}
                        alt={name}
                        title={name}
                      />
                    </div>
                  {:else}
                    <div class="card-placeholder">{name}</div>
                  {/if}
                {/each}
              </div>
              {#if selectedCard}
                <div class="add-row">
                  <button
                    onclick={() => {
                      if (selectedCard)
                        toggleCardInList(index, selectedCard.name);
                    }}
                  >
                    {list.cardNames.includes(selectedCard.name)
                      ? "Remove card"
                      : "Add card"}
                  </button>
                </div>
              {/if}
            </div>
          {/each}
          {#if customLists.length === 0}
            <p>Create a new list to add cards.</p>
          {/if}
        </div>
      {:else}
        <!-- viewing a single list -->
        <div class="view-list-header">
          <div class="view-list-actions">
            <label
              >Columns: {columnsPerRow}&nbsp;<input
                type="range"
                min="3"
                max="5"
                bind:value={columnsPerRow}
              /></label
            >
          </div>
        </div>

        <div class="list-grid" style="--columns: {columnsPerRow}">
          {#each customLists[viewIndex].cardNames as name, idx (name + "-" + idx)}
            {#if cardByName(name)}
              <div class="card-container">
                <img src={cardByName(name)?.src} alt={name} title={name} />
                <button
                  class="remove-card-btn"
                  onclick={() => removeCardFromViewedList(name)}
                >
                  Remove
                </button>
              </div>
            {:else}
              <div class="card-placeholder">{name}</div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  button {
    font-size: 20px;
    padding: 8px 16px;
    margin-top: 12px 0;
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
    z-index: 60;
  }
  .modal button {
    background: #9a630a;
  }
  .modal-content {
    width: 100%;
    max-width: 1100px;
    height: 90%;
    overflow: auto;
    background: #0f1117;
    border-radius: 12px;
    padding: 18px;
    color: #e7e9ee;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .modal-top-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 18px;
  }
  .spacer {
    flex: 1;
    font-weight: bold;
    text-align: center;
    padding: 6px 0;
    font-size: 1em;
  }
  .close-btn {
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .adding-preview-container {
    display: flex;
    justify-content: center;
    margin-bottom: 14px;
  }
  .adding-preview-container img {
    width: 50%;
    max-width: 200px;
  }

  .lists-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .list-card {
    background: #161824;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .list-header > h5 {
    color: #f7bb59;
    font-size: 1em;
    margin: 0.25em;
  }
  .list-actions {
    display: flex;
    gap: 8px;
  }
  .list-actions > button {
    background: none;
    padding: 4px;
  }
  .list-actions > button:hover {
    color: #f7bb59;
    text-decoration: underline;
  }

  .mini-list-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 120px);
  }

  .modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
  }

  .view-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }
  .list-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 5), 1fr);
  }
  .card-container {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .card-container img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  .remove-card-btn {
    color: #ffffff;
    background: none !important;
    font-size: 0.75em;
    padding: 4px;
  }
  .remove-card-btn:hover {
    color: #ff5656;
    text-decoration: underline;
  }
  .card-placeholder {
    background: #222;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    button {
      font-size: 14px;
      padding: 6px 12px;
    }

    .mini-list-grid {
      grid-template-columns: repeat(auto-fit, 54px);
    }
  }
</style>
