import Vue from "vue";

export function warn(text: string) {
  Vue.notify({
    group: "all",
    type: "warn",
    text: text,
  });
}
