<script>
  import { imageList, isMobileBrowser } from "../stores.js";
  export let order = [];
  const [order1, order2] = order;
</script>

<style>
  .small-container {
    display: grid;
    grid-template-columns: repeat(2, calc(100vw / 5));
    grid-template-rows: repeat(2, calc(100vw / 5));
  }

  .small-highlight {
    position: relative;
    transition: ease-in-out 0.2s;
  }
  .small-highlight > img {
    object-fit: cover;
    width: 100%;
    padding: 0.4%;
  }
  .small-highlight:hover {
    opacity: 0.6;
  }
  .small-highlight-text {
    display: none;
    position: absolute;
    width: 90%;
    left: 6%;
    top: 14%;
    color: #ffffff;
    font-size: calc(100vw / 85);
  }
  .small-highlight:hover > .small-highlight-text {
    display: block;
  }
  .small-highlight:hover > .overlay {
    display: block;
    opacity: 0.8;
  }

  .overlay {
    display: none;
    position: absolute;
    left: 0.2%;
    top: 0.2%;
    width: 99.5%;
    height: 99.5%;
    background: #000000;
  }

  @media screen and (max-width: 800px) {
    .small-container {
      grid-template-columns: repeat(2, calc(100vw / 2.5));
      grid-template-rows: repeat(2, calc(100vw / 2.5));
    }
  }
</style>

<div class="small-container">
  {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    {#if placement === 'smallHighlight' && placementOrder >= order1 && placementOrder <= order2}
      <div class="small-highlight">
        <div class="overlay" />
        <img loading="lazy" src={path} alt="small-highlight" />
        {#if !$isMobileBrowser}
          <div class="small-highlight-text">
            <p>Brief: {brief}</p>
            <p>ID: {id}</p>
            <p>Tools: {tools}</p>
            <p>Delivery: {delivery}</p>
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</div>
