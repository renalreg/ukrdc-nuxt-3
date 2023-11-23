import { createApp } from 'vue';

export function removeElement(el: HTMLElement) {
  if (typeof el.remove !== "undefined") el.remove();
  else el.parentNode?.removeChild(el);
}

// add the component w/ the specified props
export function spawn(id: string, propsData: Record<string, unknown>, component: any) {

  const mountEl = document.createElement("div");
  document.getElementById(id)?.appendChild(mountEl)

  return createApp(component, propsData).mount(mountEl)
}
