<script lang="ts">
  import type { CVData } from '$lib/types/cv';
  import CVHeader from './CVHeader.svelte';

  export let cv: CVData;
  export let master: any;

  // Helper function to parse bullet points from newline-separated text
  function parseBullets(text: string): string[] {
    if (!text) return [];
    return text
      .split('\n')
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter((line) => line.length > 0);
  }
</script>

<div class="cv-container">
  <CVHeader {master} headline={cv.details.role} />

  <div class="cv-content">
    <!-- Left Sidebar -->
    <aside class="cv-sidebar">
      <!-- Contact -->
      <section class="cv-section">
        <h3 class="cv-section-title">Contact</h3>
        <div class="cv-section-content">
          {#if master.personal.phone}
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <span>{master.personal.phone}</span>
            </div>
          {/if}
          {#if master.personal.email}
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <a href={`mailto:${master.personal.email}`}>{master.personal.email}</a>
            </div>
          {/if}
          {#if master.personal.website}
            <div class="contact-item">
              <span class="contact-label">Website:</span>
              <a href={master.personal.website} target="_blank">{master.personal.website}</a>
            </div>
          {/if}
          {#if master.personal.location}
            <div class="contact-item">
              <span class="contact-label">Location:</span>
              <span>{master.personal.location}</span>
            </div>
          {/if}
        </div>
      </section>

      <!-- Skills -->
      {#if cv.skills && cv.skills.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Skills</h3>
          <div class="cv-skills">
            {#each cv.skills as skill}
              <span class="skill-badge">{skill.name}</span>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Education -->
      {#if cv.education && cv.education.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Education</h3>
          <div class="cv-section-content">
            {#each cv.education as edu}
              <div class="edu-item">
                <p class="edu-institution">{edu.institution}</p>
                <p class="edu-qualification">{edu.qualification}</p>
                {#if edu.date}
                  <p class="edu-date">{edu.date}</p>
                {/if}
                {#if edu.gpa}
                  <p class="edu-gpa">GPA: {edu.gpa}</p>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}
    </aside>

    <!-- Main Content -->
    <main class="cv-main">
      <!-- Summary/About -->
      {#if cv.details.about}
        <section class="cv-section">
          <h3 class="cv-section-title">Summary</h3>
          <p class="cv-text">{cv.details.about}</p>
        </section>
      {/if}

      <!-- Experience -->
      {#if cv.workExp && cv.workExp.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Experience</h3>
          <div class="cv-section-content">
            {#each cv.workExp as work}
              <div class="work-item">
                <div class="work-header">
                  <span class="work-title">{work.title}</span>
                  <span class="work-date">{work.date}</span>
                </div>
                <p class="work-company">{work.company}</p>
                {#if work.desc}
                  <ul class="work-bullets">
                    {#each parseBullets(work.desc) as bullet}
                      <li>{bullet}</li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Projects -->
      {#if cv.projects && cv.projects.length > 0}
        <section class="cv-section">
          <h3 class="cv-section-title">Projects</h3>
          <div class="cv-section-content">
            {#each cv.projects as project}
              <div class="project-item">
                <div class="project-header">
                  <span class="project-name">{project.name}</span>
                  {#if project.link}
                    <a href={project.link} target="_blank" class="project-link">Link</a>
                  {/if}
                </div>
                {#if project.desc}
                  <p class="project-desc">{project.desc}</p>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}
    </main>
  </div>
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
    padding: 0;
    background: white;
    display: flex;
    flex-direction: column;
  }

  .cv-content {
    display: grid;
    grid-template-columns: 0.35fr 1fr;
    gap: 0;
    flex: 1;
    padding: 24px;
  }

  .cv-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-right: 1px solid #e0e0e0;
    padding-right: 20px;
  }

  .cv-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-left: 20px;
  }

  .cv-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cv-section-title {
    margin: 0;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1e40af;
    border-bottom: 2px solid #1e40af;
    padding-bottom: 6px;
  }

  .cv-section-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 10px;
  }

  .cv-text {
    margin: 0;
    font-size: 10px;
    line-height: 1.6;
    color: #333;
  }

  /* Contact Styles */
  .contact-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 9px;
  }

  .contact-label {
    font-weight: 700;
    color: #1f2937;
  }

  .contact-item a {
    color: #1e40af;
    text-decoration: none;
  }

  .contact-item a:hover {
    text-decoration: underline;
  }

  /* Skills */
  .cv-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .skill-badge {
    display: inline-block;
    background: #1e40af;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 500;
  }

  /* Education */
  .edu-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
  }

  .edu-institution {
    margin: 0;
    font-weight: 700;
    font-size: 10px;
    color: #1f2937;
  }

  .edu-qualification {
    margin: 0;
    font-size: 9px;
    color: #555;
  }

  .edu-date {
    margin: 0;
    font-size: 9px;
    color: #888;
  }

  .edu-gpa {
    margin: 0;
    font-size: 9px;
    color: #888;
  }

  /* Work Experience */
  .work-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .work-item:last-child {
    border-bottom: none;
  }

  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .work-title {
    font-weight: 700;
    font-size: 10px;
    color: #1f2937;
  }

  .work-date {
    font-size: 9px;
    color: #888;
    white-space: nowrap;
  }

  .work-company {
    margin: 0;
    font-size: 9px;
    color: #555;
    font-weight: 500;
  }

  .work-bullets {
    margin: 4px 0 0 0;
    padding-left: 16px;
    list-style: disc;
    font-size: 9px;
    color: #444;
    line-height: 1.4;
  }

  .work-bullets li {
    margin-bottom: 2px;
  }

  /* Projects */
  .project-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .project-name {
    font-weight: 700;
    font-size: 10px;
    color: #1f2937;
  }

  .project-link {
    font-size: 9px;
    color: #1e40af;
    text-decoration: none;
    white-space: nowrap;
  }

  .project-link:hover {
    text-decoration: underline;
  }

  .project-desc {
    margin: 0;
    font-size: 9px;
    color: #555;
    line-height: 1.4;
  }

  @media print {
    .cv-container {
      width: 100%;
      height: auto;
      padding: 0;
      margin: 0;
    }
  }
</style>
