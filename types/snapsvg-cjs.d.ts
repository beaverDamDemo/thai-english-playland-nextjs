declare module "snapsvg-cjs" {
  interface SnapElement {
    append(el: SnapElement | object): this;
    remove(): this;
    selectAll(selector: string): SnapElement[];
    node: SVGElement;
  }

  interface SnapStatic {
    (selector: string | SVGSVGElement): SnapElement;
    load(url: string, callback: (fragment: object) => void): void;
  }

  const Snap: SnapStatic;
  export = Snap;
}
