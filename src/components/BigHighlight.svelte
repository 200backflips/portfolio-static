<script>
  import { imageList } from "../stores.js";
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
    padding: 0.2%;
  }
  .big-highlight-text {
    display: none;
    position: absolute;
    width: 80%;
    left: 6%;
    top: 18%;
    color: #ffffff;
    font-size: calc(100vw / 55);
  }
  .big-highlight:hover > .big-highlight-text {
    display: block;
  }
  .big-highlight:hover > .overlay {
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
</style>

{#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }, i}
  {#if placement === 'bigHighlight' && placementOrder === order}
    <div class="big-highlight">
      <div class="overlay" />
      <img loading="lazy" src={path} alt="big-highlight" />
      <div class="big-highlight-text">
        <p>Brief: {brief}</p>
        <p>ID: {id}</p>
        <p>Tools: {tools}</p>
        <p>Delivery: {delivery}</p>
      </div>
    </div>
  {/if}
{/each}
