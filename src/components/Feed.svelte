<script>
  import BigHighlight from "./BigHighlight.svelte";
  import SmallHighlights from "./SmallHighlights.svelte";
  import OtherImages from "./OtherImages.svelte";
</script>

<style>
  .Feed {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    height: 80vh;
    margin: 0 auto;
    overflow: auto;
  }
  .Feed::-webkit-scrollbar {
    display: none;
  }

  .highlights-container {
    display: grid;
    grid-template-columns: repeat(2, calc(100vw / 2.5));
    grid-template-rows: repeat(1, calc(100vw / 2.5));
  }
  @media screen and (max-width: 800px) {
    .highlights-container {
      grid-template-columns: repeat(1, calc(100vw / 1.25));
      grid-template-rows: repeat(1, calc(100vw / 1.25));
    }
  }
</style>

<div class="Feed">
  <div class="highlights-container">
    <BigHighlight order={0} />
    <SmallHighlights order={[0, 3]} />
  </div>
  <OtherImages order={[0, 5]} />
  <div class="highlights-container">
    <BigHighlight order={1} />
    <SmallHighlights order={[4, 7]} />
  </div>
  <OtherImages order={[6, 11]} />
</div>
