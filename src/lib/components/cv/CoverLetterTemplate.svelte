<script lang="ts">
  import CVHeader from './CVHeader.svelte';

  export let coverLetter: string;
  export let master: any;
</script>

<div class="letter-container">
  <CVHeader {master} />

  <main class="letter-content">
    <div class="letter-body">
      {@html coverLetter}
    </div>

    <footer class="letter-footer">
      <p class="footer-closing">Sincerely,</p>
      <p class="footer-name">{master.personal.firstName} {master.personal.lastName}</p>
    </footer>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a;
    background: #fff;
    line-height: 1.6;
  }

  .letter-container {
    width: 210mm;
    height: 297mm;
    padding: 16mm;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .letter-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .letter-body {
    font-size: 11px;
    line-height: 1.8;
    color: #374151;
    white-space: pre-wrap;
    word-wrap: break-word;
    text-align: justify;
  }

  .letter-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  .footer-closing {
    margin: 0;
    font-size: 11px;
    color: #374151;
    font-weight: 500;
  }

  .footer-name {
    margin: 0;
    font-size: 11px;
    color: #1f2937;
    font-weight: 600;
  }

  @media print {
    .letter-container {
      width: 100%;
      height: auto;
      padding: 16mm;
      margin: 0;
    }
  }
</style>