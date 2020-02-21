<script>
  import { imageList, isMobileBrowser } from "../stores.js";
  export let order = [];
  const [order1, order2] = order;
</script>

<style>
  .other-container {
    display: grid;
    grid-template-columns: repeat(3, 364px);
    grid-template-rows: repeat(1, 364px);
  }
  .other-imgs {
    position: relative;
    transition: ease-in-out 0.2s;
  }
  .other-imgs:hover {
    opacity: 0.6;
  }
  .other-imgs > img {
    position: relative;
    object-fit: cover;
    width: 100%;
    padding: 0.1rem;
    transition: ease-in-out 0.2s;
  }
  .other-imgs-text {
    display: none;
    position: absolute;
    width: 300px;
    margin: 0 auto;
    left: 8%;
    top: 14%;
    color: #ffffff;
    text-shadow: 2px 2px 3px #000000;
    font-size: 1.1rem;
  }
  .other-imgs:hover > .other-imgs-text {
    display: block;
  }

  @media screen and (max-width: 400px) {
    .other-container {
      grid-template-columns: repeat(2, 150px);
      grid-template-rows: repeat(1, 150px);
    }
  }
</style>

<div class="other-container">
  {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    {#if placement === 'otherImages' && placementOrder >= order1 && placementOrder <= order2}
      <div class="other-imgs">
        <img src={path} alt="other-images" />
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
