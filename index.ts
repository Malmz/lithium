import { render, html } from "@github/jtml";
import type { TemplateResult } from "@github/jtml";
import { camelCase, kebabCase } from "lodash-es";

export { html };
export type RenderResult = TemplateResult;

export function tag(selector: string) {
  return function (target: CustomElementConstructor) {
    customElements.define(selector, target);
  };
}

export function attr() {
  return function <T extends Component>(target: T, propertyKey: string) {
    (target.constructor as typeof Component).createAttr(propertyKey);
  };
}

export abstract class Component extends HTMLElement {
  static observed: string[] = [];
  static get observedAttributes(): string[] {
    return this.observed;
  }

  static createAttr(propertyKey: string) {
    this.observed.push(kebabCase(propertyKey));
    const key = Symbol();
    Reflect.defineProperty(this.prototype, propertyKey, {
      set(this: Component, next: unknown) {
        const old = (this as any)[key] as unknown;
        (this as any)[key] = next;
        this.requestUpdate(propertyKey, old);
      },
      get(): any {
        return (this as any)[key];
      },
      configurable: true,
      enumerable: true,
    });
  }

  private shadow!: ShadowRoot;
  private enableUpdate!: Function;
  private updatePromise: Promise<void>;
  private updatePending: boolean = false;

  constructor() {
    super();
    this.updatePromise = new Promise((res) => (this.enableUpdate = res));
    this.requestUpdate();
  }

  connectedCallback() {
    if (this.shadow === undefined) {
      this.shadow = this.attachShadow({ mode: "closed" });
    }
    this.enableUpdate();
    this.connect && this.connect();
  }

  disconnectedCallback() {
    this.disconnect && this.disconnect();
  }

  adoptedCallback() {
    this.adpoted && this.adpoted();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    const key = camelCase(name);
    this[key as keyof this] = newValue as any;
  }

  public requestUpdate(name?: string, old?: unknown) {
    let shouldUpdate = true;
    if (name !== undefined) {
      const value = this[name as keyof this];
      shouldUpdate = value != old && old === old && value === value;
    }
    if (!this.updatePending && shouldUpdate) {
      this.updatePromise = this.queueUpdate();
    }
  }

  private async queueUpdate() {
    this.updatePending = true;
    await this.updatePromise;
    this.update();
  }

  private update() {
    if (this.shadow != null) {
      render(this.render(), this.shadow);
    } else {
      console.log("no shadow");
    }
    this.updatePending = false;
  }

  abstract render(): RenderResult;
}

export interface Component {
  connect?(): void | Promise<void>;
  disconnect?(): void | Promise<void>;
  adpoted?(): void | Promise<void>;
}
