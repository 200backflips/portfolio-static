<script>
  import { imageList, isMobileBrowser } from "../stores.js";
  export let order;
</script>

<style>
  .big-highlight {
    position: relative;
    transition: ease-in-out 0.2s;
  }
  .big-highlight > img {
    object-fit: cover;
    width: 100%;
    padding: 0.1rem;
  }
  .big-highlight:hover {
    opacity: 0.6;
  }
  .big-highlight-text {
    display: none;
    position: absolute;
    width: 500px;
    margin: 0 auto;
    left: 4%;
    top: 18%;
    color: #ffffff;
    text-shadow: 2px 2px 3px #000000;
    font-size: 1.4rem;
  }
  .big-highlight:hover > .big-highlight-text {
    display: block;
    z-index: 2;
    opacity: 1;
  }
</style>

{#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }, i}
  {#if placement === 'bigHighlight' && placementOrder === order}
    <div class="big-highlight">
      <img src={path} lazy={i > 1} alt="big-highlight" />
      {#if !$isMobileBrowser}
        <div class="big-highlight-text">
          <p>Brief: {brief}</p>
          <p>ID: {id}</p>
          <p>Tools: {tools}</p>
          <p>Delivery: {delivery}</p>
        </div>
      {/if}
    </div>
  {/if}
{/each}
