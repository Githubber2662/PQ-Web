const STORAGE_KEY = 'pq-web-jukebox-v1';

export type JukeboxTrack = {
  id: string;
  title: string;
  file?: string;
};

export function createJukebox(container: HTMLElement): {
  setTrack: (trackId: string) => void;
  setVolume: (value: number) => void;
  pause: () => void;
  resume: () => void;
} {
  const tracks: JukeboxTrack[] = [
    { id: 'theme-01', title: 'Marble City Theme' },
    { id: 'theme-02', title: 'Platinum Run' },
    { id: 'theme-03', title: 'Arcade Horizon' }
  ];

  const state = {
    current: tracks[0].id,
    volume: Number(localStorage.getItem(STORAGE_KEY) ?? '0.6')
  };

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <h3>Jukebox</h3>
    <div class="controls">
      <select id="track-select"></select>
      <button type="button" id="toggle-audio">Pause</button>
    </div>
    <label>
      Volume
      <input id="volume-control" type="range" min="0" max="1" step="0.05" value="${state.volume}" />
    </label>
  `;

  const select = panel.querySelector('#track-select') as HTMLSelectElement;
  for (const track of tracks) {
    const option = document.createElement('option');
    option.value = track.id;
    option.textContent = track.title;
    if (track.id === state.current) option.selected = true;
    select.appendChild(option);
  }

  const toggle = panel.querySelector('#toggle-audio') as HTMLButtonElement;
  const volume = panel.querySelector('#volume-control') as HTMLInputElement;
  volume.value = String(state.volume);

  let playing = true;

  const updateStorage = () => {
    localStorage.setItem(STORAGE_KEY, String(state.volume));
  };

  const setTrack = (trackId: string) => {
    state.current = trackId;
    toggle.textContent = playing ? 'Pause' : 'Play';
  };

  const setVolume = (value: number) => {
    state.volume = Math.max(0, Math.min(1, value));
    volume.value = String(state.volume);
    updateStorage();
  };

  const pause = () => {
    playing = false;
    toggle.textContent = 'Play';
  };

  const resume = () => {
    playing = true;
    toggle.textContent = 'Pause';
  };

  select.addEventListener('change', () => setTrack(select.value));
  toggle.addEventListener('click', () => {
    if (playing) {
      pause();
    } else {
      resume();
    }
  });
  volume.addEventListener('input', () => setVolume(Number(volume.value)));

  container.appendChild(panel);

  return { setTrack, setVolume, pause, resume };
}
