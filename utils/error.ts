import Vue from "vue";

export function error(e: Error) {
  if (typeof e === "string") {
    showError(e);
    return;
  }

  showError(e.message);

  function showError(text: string) {
    Vue.notify({
      group: "all",
      type: "error",
      text: text,
    });
  }
}
