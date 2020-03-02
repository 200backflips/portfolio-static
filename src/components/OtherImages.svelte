<script>
  import { imageList, isMobileBrowser } from "../stores.js";
  export let order = [];
  const [order1, order2] = order;
</script>

<style>
  .other-container {
    display: grid;
    grid-template-columns: repeat(3, calc(100vw / 3.75));
    grid-template-rows: repeat(2, calc(100vw / 3.75));
  }
  .other-imgs {
    position: relative;
    transition: ease-in-out 0.2s;
  }
  .other-imgs > img {
    object-fit: cover;
    width: 100%;
    padding: 0.3%;
    transition: ease-in-out 0.2s;
  }
  .other-imgs-text {
    display: none;
    position: absolute;
    width: 80%;
    margin: 0 auto;
    left: 8%;
    top: 14%;
    color: #ffffff;
    font-size: 1.2rem;
  }
  .other-imgs:hover > .other-imgs-text {
    display: block;
  }
  .other-imgs:hover > .overlay {
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

  @media screen and (max-width: 600px) {
    .other-container {
      grid-template-columns: repeat(2, calc(100vw / 2.5));
      grid-template-rows: repeat(3, calc(100vw / 2.5));
    }
  }
</style>

<div class="other-container">
  {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    {#if placement === 'otherImages' && placementOrder >= order1 && placementOrder <= order2}
      <div class="other-imgs">
        <div class="overlay" />
        <img loading="lazy" src={path} alt="other-images" />
        {#if !$isMobileBrowser}
          <div class="other-imgs-text">
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
