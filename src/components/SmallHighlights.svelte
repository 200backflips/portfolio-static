<script>
  import { imageList, isMobileBrowser } from "../stores.js";
  export let order = [];
  const [order1, order2] = order;
</script>

<style>
  .small-container {
    display: grid;
    grid-template-columns: repeat(2, 273px);
    grid-template-rows: repeat(2, 273px);
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
    width: 80%;
    margin: 0 auto;
    left: 6%;
    top: 12%;
    color: #ffffff;
    font-size: 1rem;
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
    width: 99.6%;
    height: 99.6%;
    margin: 0 auto;
    background: #000000;
  }

  @media screen and (max-width: 400px) {
    .small-container {
      grid-template-columns: repeat(2, 150px);
      grid-template-rows: repeat(1, 150px);
    }
  }
</style>

<div class="small-container">
  {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    {#if placement === 'smallHighlight' && placementOrder >= order1 && placementOrder <= order2}
      <div class="small-highlight">
      <div class="overlay" />
        <img src={path} alt="small-highlight" />
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
