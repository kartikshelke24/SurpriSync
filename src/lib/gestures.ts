/**
 * Gesture detection utilities for interactive reveal experience
 */

export interface GestureEvent {
  type: "swipe-left" | "swipe-right" | "tap" | "long-press" | "double-tap";
  x: number;
  y: number;
}

export type GestureHandler = (event: GestureEvent) => void;

/**
 * Simple gesture detector supporting swipes and taps
 */
export class GestureDetector {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private lastTapTime = 0;
  private handlers: Map<GestureEvent["type"], GestureHandler[]> = new Map();
  private longPressTimeout: NodeJS.Timeout | null = null;
  private element: HTMLElement | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.attachListeners();
  }

  private attachListeners() {
    if (!this.element) return;

    this.element.addEventListener("touchstart", this.handleTouchStart.bind(this));
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this));
    this.element.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.element.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.element.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  private handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();

    // Start long press timer
    this.longPressTimeout = setTimeout(() => {
      this.emit("long-press", this.startX, this.startY);
    }, 500);
  }

  private handleTouchMove(e: TouchEvent) {
    // Cancel long press if user moves
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const duration = Date.now() - this.startTime;

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Swipe detection: movement > 50px in less than 500ms
    if (distance > 50 && duration < 500) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          this.emit("swipe-left", endX, endY);
        } else {
          this.emit("swipe-right", endX, endY);
        }
      }
    }
    // Tap detection: minimal movement in less than 250ms
    else if (distance < 20 && duration < 250) {
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        this.emit("double-tap", endX, endY);
      } else {
        this.emit("tap", endX, endY);
      }
      this.lastTapTime = now;
    }
  }

  private handleMouseDown(e: MouseEvent) {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = Date.now();

    this.longPressTimeout = setTimeout(() => {
      this.emit("long-press", this.startX, this.startY);
    }, 500);
  }

  private handleMouseUp(e: MouseEvent) {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }

    const endX = e.clientX;
    const endY = e.clientY;
    const duration = Date.now() - this.startTime;

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 50 && duration < 500) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          this.emit("swipe-left", endX, endY);
        } else {
          this.emit("swipe-right", endX, endY);
        }
      }
    } else if (distance < 20 && duration < 250) {
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        this.emit("double-tap", endX, endY);
      } else {
        this.emit("tap", endX, endY);
      }
      this.lastTapTime = now;
    }
  }

  private emit(type: GestureEvent["type"], x: number, y: number) {
    const handlers = this.handlers.get(type) || [];
    handlers.forEach((handler) => handler({ type, x, y }));
  }

  on(type: GestureEvent["type"], handler: GestureHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  off(type: GestureEvent["type"], handler: GestureHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }
  }

  destroy() {
    if (this.longPressTimeout) clearTimeout(this.longPressTimeout);
    if (this.element) {
      this.element.removeEventListener("touchstart", this.handleTouchStart);
      this.element.removeEventListener("touchend", this.handleTouchEnd);
      this.element.removeEventListener("mousedown", this.handleMouseDown);
      this.element.removeEventListener("mouseup", this.handleMouseUp);
    }
  }
}
