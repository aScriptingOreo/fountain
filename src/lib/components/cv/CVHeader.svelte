<script lang="ts">
  export let master: any;
  export let headline: string = '';
  export let role: string = '';
</script>

<header class="cv-header">
  <div class="header-main">
    <h1 class="cv-name">{master.personal.firstName} {master.personal.lastName}</h1>
    <h2 class="cv-headline">{headline || role || master.personal.title}</h2>
    <p class="cv-subtitle">
      {master.personal.location}
      {#if master.personal.suffix}
        • {master.personal.suffix}
      {/if}
    </p>
    {#if master.personal.github || master.personal.linkedin || master.personal.email || master.personal.phone || master.personal.website}
      <div class="cv-contact-links">
        {#if master.personal.github}
          <a href="https://github.com/{master.personal.github}" class="contact-link">GitHub</a>
        {/if}
        {#if master.personal.linkedin}
          <a href="https://linkedin.com/in/{master.personal.linkedin}" class="contact-link">LinkedIn</a>
        {/if}
        {#if master.personal.email}
          <a href={`mailto:${master.personal.email}`} class="contact-link">{master.personal.email}</a>
        {/if}
        {#if master.personal.phone}
          <a href={`tel:${master.personal.phone}`} class="contact-link">{master.personal.phone}</a>
        {/if}
        {#if master.personal.website}
          <a href={master.personal.website} class="contact-link">Website</a>
        {/if}
      </div>
    {/if}
  </div>
</header>

<style>
  .cv-header {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    color: white;
    padding: 18px;
    margin: 0;
    border-radius: 0;
  }

  .header-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cv-name {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
  }

  .cv-headline {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .cv-subtitle {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }

  .cv-contact-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }

  .contact-link {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
  }

  .contact-link:hover {
    color: white;
    border-bottom: 1px solid white;
  }
</style>
