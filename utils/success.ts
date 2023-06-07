import Vue from "vue";

export function success(text: string) {
  Vue.notify({
    group: "all",
    type: "success",
    text,
  });
}
