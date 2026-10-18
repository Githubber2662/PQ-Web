import { loadAllSavedLevels, saveLevel, deleteLevel, type LocalLevel } from './storage';

export type LevelEditorOptions = {
  onLoad: (level: LocalLevel) => void;
};

export function createLevelEditor(container: HTMLElement, options: LevelEditorOptions): void {
  const form = document.createElement('form');
  form.className = 'panel';
  form.innerHTML = `
    <h3>Level Editor</h3>
    <div class="controls">
      <input name="id" placeholder="Level ID" value="level-demo" />
      <input name="name" placeholder="Level name" value="Demo Track" />
      <input name="author" placeholder="Author" value="You" />
      <input name="music" placeholder="Music" value="theme-01" />
      <input name="gravity" type="number" step="10" value="1200" />
      <input name="spawnX" type="number" step="10" value="160" />
      <input name="spawnY" type="number" step="10" value="180" />
      <input name="timeLimit" type="number" step="10" value="120" />
    </div>
    <div class="controls">
      <button type="submit">Save to localStorage</button>
      <button type="button" data-action="load-random">Load latest</button>
      <button type="button" data-action="delete-current">Delete current</button>
    </div>
  `;

  const list = document.createElement('ul');
  list.className = 'level-list';

  const refreshList = () => {
    list.innerHTML = '';
    for (const level of loadAllSavedLevels()) {
      const item = document.createElement('li');
      item.innerHTML = `
        <span>${level.name}</span>
        <button type="button" data-id="${level.id}">Load</button>
      `;
      item.querySelector('button')?.addEventListener('click', () => {
        form.id.value = level.id;
        form.name.value = level.name;
        form.author.value = level.author;
        form.music.value = level.music;
        form.gravity.value = String(level.gravity);
        form.spawnX.value = String(level.spawnX);
        form.spawnY.value = String(level.spawnY);
        form.timeLimit.value = String(level.timeLimit);
        options.onLoad(level);
      });
      list.appendChild(item);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const level: LocalLevel = {
      id: data.id || `level-${Date.now()}`,
      name: data.name || 'Untitled',
      author: data.author || 'Unknown',
      gravity: Number(data.gravity || 1200),
      spawnX: Number(data.spawnX || 160),
      spawnY: Number(data.spawnY || 180),
      music: data.music || 'theme-01',
      timeLimit: Number(data.timeLimit || 120)
    };
    saveLevel(level);
    refreshList();
    options.onLoad(level);
  });

  form.querySelector('[data-action="load-random"]')?.addEventListener('click', () => {
    const levels = loadAllSavedLevels();
    const level = levels[levels.length - 1];
    if (!level) {
      return;
    }
    form.id.value = level.id;
    form.name.value = level.name;
    form.author.value = level.author;
    form.music.value = level.music;
    form.gravity.value = String(level.gravity);
    form.spawnX.value = String(level.spawnX);
    form.spawnY.value = String(level.spawnY);
    form.timeLimit.value = String(level.timeLimit);
    options.onLoad(level);
  });

  form.querySelector('[data-action="delete-current"]')?.addEventListener('click', () => {
    const id = (form.id as HTMLInputElement).value;
    if (!id) {
      return;
    }
    deleteLevel(id);
    refreshList();
  });

  container.appendChild(form);
  const listPanel = document.createElement('div');
  listPanel.className = 'panel';
  listPanel.appendChild(list);
  container.appendChild(listPanel);
  refreshList();
}
