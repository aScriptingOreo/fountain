<script lang="ts">
  import type { CVData } from '$lib/types/cv';
  import CVHeader from './CVHeader.svelte';

  export let cv: CVData;
  export let master: any;
</script>

<div class="cv-container">
  <CVHeader {master} />

  <main class="cv-content">
    <div class="cv-left">
      <!-- Profile Summary -->
      {#if cv.details?.about}
        <section class="cv-section">
          <h3 class="cv-section-title">Profile</h3>
          <p class="cv-summary">{cv.details.about}</p>
        </section>
      {/if}

      <!-- Experience -->
      {#if cv.workExp && cv.workExp.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Experience</h3>
          <ul class="cv-list">
            {#each cv.workExp as exp}
              <li class="cv-list-item">
                <span class="cv-list-title">{exp.company} — {exp.title}</span>
                <span class="cv-list-date">{exp.date}</span>
                <span class="cv-list-desc">{exp.desc}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Projects -->
      {#if cv.projects && cv.projects.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Projects</h3>
          <ul class="cv-list">
            {#each cv.projects as proj}
              <li class="cv-list-item">
                <span class="cv-list-title">{proj.name}</span>
                <span class="cv-list-desc">{proj.desc}</span>
                {#if proj.link}
                  <a href={proj.link} class="cv-list-link">{proj.link}</a>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    </div>

    <!-- Right Sidebar -->
    <aside class="cv-right">
      <!-- Skills -->
      {#if cv.skills && cv.skills.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Skills</h3>
          <ul class="cv-skills-list">
            {#each cv.skills as skill}
              <li class="cv-skill-item">
                <span class="cv-skill-name">{skill.name}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Education -->
      {#if cv.education && cv.education.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Education</h3>
          <ul class="cv-list">
            {#each cv.education as edu}
              <li class="cv-list-item">
                <span class="cv-list-title">{edu.institution}</span>
                <span class="cv-list-desc">{edu.qualification}</span>
                <span class="cv-list-date">{edu.date}</span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <!-- Contact Info -->
      <section class="cv-section">
        <h3 class="cv-section-title">Contact</h3>
        <div class="cv-contact">
          <p class="cv-contact-name">{master.personal.firstName} {master.personal.lastName}</p>
          <p class="cv-contact-title">{master.personal.title || cv.details?.role}</p>
          {#if master.personal.location}
            <p class="cv-contact-location">{master.personal.location}</p>
          {/if}
          {#if master.personal.email}
            <p class="cv-contact-email">{master.personal.email}</p>
          {/if}
          {#if master.personal.phone}
            <p class="cv-contact-phone">{master.personal.phone}</p>
          {/if}
        </div>
      </section>
    </aside>
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

  .cv-container {
    width: 210mm;
    height: 297mm;
    padding: 16mm;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cv-content {
    display: grid;
    grid-template-columns: 1.8fr 1fr;
    gap: 18px;
    flex: 1;
  }

  .cv-left {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cv-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cv-section {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .cv-section-title {
    margin: 0;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #1e40af;
    border-bottom: 2px solid #1e40af;
    padding-bottom: 6px;
  }

  .cv-summary {
    margin: 0;
    font-size: 10px;
    line-height: 1.7;
    color: #374151;
  }

  .cv-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cv-list-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cv-list-title {
    font-weight: 700;
    color: #1f2937;
    font-size: 10px;
  }

  .cv-list-desc {
    color: #6b7280;
    line-height: 1.5;
    font-size: 9px;
  }

  .cv-skills-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .cv-skill-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cv-skill-name {
    font-weight: 700;
    font-size: 10px;
    color: #1f2937;
  }

  .cv-contact {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cv-contact-name {
    margin: 0;
    font-size: 10px;
    font-weight: 700;
    color: #1f2937;
  }

  .cv-contact-title {
    margin: 0;
    font-size: 9px;
    color: #6b7280;
  }

  .cv-contact-location {
    margin: 0;
    font-size: 9px;
    color: #9ca3af;
  }

  @media print {
    .cv-container {
      width: 100%;
      height: auto;
      padding: 16mm;
      margin: 0;
    }
  }
</style>
