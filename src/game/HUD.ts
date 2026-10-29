export class HUD {
  private gemsValue: HTMLElement;
  private statusValue: HTMLElement;

  constructor() {
    this.gemsValue = document.getElementById("gems-value") as HTMLElement;
    this.statusValue = document.getElementById("status-value") as HTMLElement;
  }

  setGems(collected: number, total: number) {
    this.gemsValue.textContent = `${collected} / ${total}`;
  }

  setStatus(text: string) {
    this.statusValue.textContent = text;
  }
}
