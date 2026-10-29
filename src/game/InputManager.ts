export type InputName = "left" | "right" | "jump" | "up" | "down";

export class InputManager {
  private keyboard = new Set<string>();
  private touch = new Set<InputName>();

  constructor() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      this.keyboard.add(key);

      if (key === " ") {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keyboard.delete(event.key.toLowerCase());
    });

    this.bindTouchButtons();
  }

  private bindTouchButtons() {
    const buttons = document.querySelectorAll("[data-input]") as NodeListOf<HTMLButtonElement>;

    buttons.forEach((button) => {
      const name = button.dataset.input as InputName;
      const setPressed = (pressed: boolean) => {
        if (pressed) this.touch.add(name);
        else this.touch.delete(name);
      };

      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        setPressed(true);
      });

      button.addEventListener("pointerup", () => setPressed(false));
      button.addEventListener("pointerleave", () => setPressed(false));
      button.addEventListener("pointercancel", () => setPressed(false));
    });
  }

  isPressed(name: InputName): boolean {
    const keyboardMap: Record<InputName, string[]> = {
      left: ["a", "arrowleft"],
      right: ["d", "arrowright"],
      jump: [" "],
      up: ["w", "arrowup"],
      down: ["s", "arrowdown"]
    };

    for (const key of keyboardMap[name]) {
      if (this.keyboard.has(key)) return true;
    }

    return this.touch.has(name);
  }
}
