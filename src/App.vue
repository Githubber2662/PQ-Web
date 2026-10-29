<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Marble Blast + PlatinumQuest</p>
        <h1>PQ-Web</h1>
      </div>
      <a class="brand-link" href="/" aria-label="Home">Marbleland</a>
    </header>

    <main class="content">
      <section class="hero panel">
        <div>
          <p class="eyebrow accent">Custom level browser</p>
          <h2>Explore community levels and mission packs</h2>
          <p>
            A clean-room web front end inspired by Marbleland, built as a polished layer on top of the PQ-Web data model.
          </p>
        </div>

        <div class="hero-actions">
          <button @click="loadFeatured">Featured</button>
          <button class="secondary" @click="loadAll">Browse all</button>
        </div>
      </section>

      <section class="toolbar panel">
        <input v-model="query" type="search" placeholder="Search levels, authors, tags..." @input="refresh" />

        <select v-model="difficulty" @change="refresh">
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>

        <select v-model="tag" @change="refresh">
          <option value="">All tags</option>
          <option value="classic">Classic</option>
          <option value="training">Training</option>
          <option value="speedrun">Speedrun</option>
          <option value="precision">Precision</option>
          <option value="boost">Boost</option>
          <option value="arena">Arena</option>
        </select>
      </section>

      <section v-if="featured.length" class="featured-grid">
        <article v-for="level in featured" :key="level.id" class="level-card featured panel" @click="openLevel(level.id)">
          <div class="thumb" :data-theme="level.thumbnail || 'default'">{{ level.name.charAt(0) }}</div>
          <div class="card-body">
            <div class="card-header">
              <h3>{{ level.name }}</h3>
              <span class="badge" :class="level.difficulty">{{ level.difficulty }}</span>
            </div>
            <p>{{ level.description }}</p>
            <div class="meta-row">
              <span>By {{ level.author }}</span>
              <span>{{ level.time }}s</span>
            </div>
          </div>
        </article>
      </section>

      <section v-if="selectedLevel" class="detail panel">
        <div>
          <p class="eyebrow accent">Selected level</p>
          <h2>{{ selectedLevel.name }}</h2>
        </div>

        <div class="detail-flex">
          <div>
            <p>{{ selectedLevel.description }}</p>
            <div class="tag-list">
              <span v-for="tagName in selectedLevel.tags" :key="tagName" class="tag">{{ tagName }}</span>
            </div>
          </div>

          <div class="stats-box">
            <div><strong>Author</strong><span>{{ selectedLevel.author }}</span></div>
            <div><strong>Difficulty</strong><span>{{ selectedLevel.difficulty }}</span></div>
            <div><strong>Time</strong><span>{{ selectedLevel.time }}s</span></div>
            <div><strong>Gems</strong><span>{{ selectedLevel.gems }}</span></div>
          </div>
        </div>

        <div class="detail-actions">
          <button @click="downloadLevel(selectedLevel.id)">Download JSON</button>
          <button class="secondary" @click="selectedLevel = null">Close</button>
        </div>
      </section>

      <section class="results-grid">
        <article v-for="level in levels" :key="level.id" class="level-card panel" @click="openLevel(level.id)">
          <div class="card-header">
            <h3>{{ level.name }}</h3>
            <span class="badge" :class="level.difficulty">{{ level.difficulty }}</span>
          </div>
          <p>{{ level.description }}</p>
          <div class="meta-row">
            <span>{{ level.author }}</span>
            <span>{{ level.size }}</span>
          </div>
          <div class="tag-list">
            <span v-for="tagName in level.tags.slice(0, 3)" :key="`${level.id}-${tagName}`" class="tag">{{ tagName }}</span>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { LevelRecord } from '../server/data/levels';

const levels = ref<LevelRecord[]>([]);
const featured = ref<LevelRecord[]>([]);
const selectedLevel = ref<LevelRecord | null>(null);
const query = ref('');
const difficulty = ref('');
const tag = ref('');

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function loadFeatured() {
  const response = await fetchJson('/api/levels/featured');
  featured.value = response.items;
}

async function refresh() {
  const params = new URLSearchParams();
  if (query.value) params.set('q', query.value);
  if (difficulty.value) params.set('difficulty', difficulty.value);
  if (tag.value) params.set('tag', tag.value);

  const url = `/api/levels${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchJson(url);
  levels.value = response.items;
}

async function loadAll() {
  await refresh();
}

async function openLevel(id: string) {
  const level = await fetchJson(`/api/levels/${id}`);
  selectedLevel.value = level;
}

async function downloadLevel(id: string) {
  const link = document.createElement('a');
  link.href = `/api/levels/${id}/download`;
  link.download = `${id}.json`;
  link.click();
}

onMounted(async () => {
  await loadFeatured();
  await refresh();
});
</script>

<style scoped>
:global(body) {
  margin: 0;
  background: linear-gradient(180deg, #0a1523 0%, #111f30 100%);
  color: #edf7ff;
}

:global(*) {
  box-sizing: border-box;
}

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 18px 60px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(237, 247, 255, 0.7);
}

.eyebrow.accent {
  color: #7ef0ff;
}

h1, h2, h3, p {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 4vw, 3.5rem);
}

h2 {
  font-size: clamp(1.6rem, 3vw, 2.5rem);
}

.brand-link {
  color: #7ef0ff;
  text-decoration: none;
  font-weight: 700;
}

.content {
  display: grid;
  gap: 18px;
}

.panel {
  background: rgba(12, 19, 29, 0.78);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 28px 24px;
}

.hero p {
  margin-top: 12px;
  max-width: 760px;
  color: rgba(237,247,255,0.8);
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

button {
  appearance: none;
  border: none;
  background: linear-gradient(135deg, #7ef0ff, #5eb8ff);
  color: #052237;
  font-weight: 700;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
}

button.secondary {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text, #edf7ff);
}

.toolbar {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 0.8fr;
  gap: 12px;
  padding: 12px;
}

input, select {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
  color: #edf7ff;
  padding: 12px 14px;
  font: inherit;
}

.featured-grid,
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.level-card {
  padding: 18px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.level-card:hover {
  transform: translateY(-2px);
  border-color: rgba(126, 240, 255, 0.4);
}

.level-card.featured {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 16px;
}

.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 18px;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, rgba(126,240,255,0.18), rgba(94,184,255,0.22));
  border: 1px solid rgba(126,240,255,0.3);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.badge {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid transparent;
}

.badge.easy { background: rgba(109, 214, 143, 0.18); color: #8fe0b2; border-color: rgba(109,214,143,0.28); }
.badge.normal { background: rgba(94,184,255,0.18); color: #90d4ff; border-color: rgba(94,184,255,0.28); }
.badge.hard { background: rgba(255,184,77,0.18); color: #ffca74; border-color: rgba(255,184,77,0.28); }
.badge.expert { background: rgba(255,106,106,0.18); color: #ff9a9a; border-color: rgba(255,106,106,0.28); }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-card p {
  color: rgba(237,247,255,0.77);
  line-height: 1.5;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: rgba(237,247,255,0.72);
  font-size: 0.92rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  display: inline-flex;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  border: 1px solid rgba(126,240,255,0.25);
  background: rgba(126,240,255,0.08);
  color: #c2f7ff;
}

.detail {
  padding: 22px 20px;
}

.detail-flex {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-top: 18px;
}

.detail p {
  color: rgba(237,247,255,0.8);
  line-height: 1.6;
}

.stats-box {
  min-width: 260px;
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.08);
}

.stats-box div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: rgba(237,247,255,0.8);
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

@media (max-width: 760px) {
  .hero,
  .detail-flex,
  .toolbar,
  .topbar {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero {
    padding: 20px 18px;
  }

  .hero-actions,
  .detail-actions {
    flex-direction: column;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .stats-box {
    min-width: 0;
  }
}
</style>
