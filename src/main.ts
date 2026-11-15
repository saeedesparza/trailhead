import './styles.css';

// M0 placeholder. M1.2 replaces this with the Today view.
const app = document.querySelector<HTMLElement>('#app');
if (app) {
  app.innerHTML = `
    <section class="panel center">
      <p class="eyebrow">Trailhead · TCSS 490 Artifact 5</p>
      <h1>Trailhead</h1>
      <p class="muted">The full-stack gym log is being built. See the plan and log on GitHub.</p>
      <a class="btn" href="https://github.com/saeedesparza/trailhead">Follow along →</a>
    </section>`;
}
