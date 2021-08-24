# Lithium
A very small library to remove some boilerplate when writing web components

## Example

First define a new component 

```typescript
import { attr, Component, html, RenderResult, tag } from "@malmz/lithium";


@tag("hello-component") // shorthand for registering the custom element
export class HelloComponent extends Component {

  @attr() // @attr marks the variable to listen to changes
  name = '';
  
  @attr()
  lastName = ''; // note that camelcase is transformed to kebabcase when used as an attribute
  
  // Called when some attribute is changed
  render(): RenderResult {
    return html`<p>Hello ${this.name} ${this.lastName}</p>`;
  }
}
```

Compile and load into the page

```html
<script type="module" src="src/main.js"></script>
```

And then it's as simple as using it

```html
<body>
  <!-- note the kebabcase on last-name -->
  <hello-component name="Jon" last-name="Doe"></hello-component>
</body>
```
