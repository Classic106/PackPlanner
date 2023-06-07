<template>
  <div class="d-flex flex-column">
    <select v-model="filter" class="d-flex flex-column mb-2">
      <option :value="null">All</option>
      <option :value="'packed'">Packed</option>
      <option :value="'not_packed'">Not packed</option>
    </select>
    <vueCustomScrollbar class="scroll overflow-auto" :settings="settings">
      <ul class="d-flex flex-column p-0">
        <li
          v-for="(item, index) in currentItems"
          :key="`${item.id}_${index}`"
          class="p-0"
          v-b-tooltip.hover
          :title="item.title || 'undefined'"
        >
          <div
            class="d-flex position-relative align-items-center justify-content-between"
            :class="item.packed && 'item'"
          >
            <p class="text-ellipsis m-0 mr-2">
              {{ item.title || "undefined" }}
            </p>
            <div
              class="box mr-lg-3 mr-sm-1 mr-0"
              :style="{ 'background-color': item.color }"
            />
          </div>
        </li>
      </ul>
    </vueCustomScrollbar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { PropType } from "vue";
import { IPackedBox } from "~/types";
import { IItemsTypes } from "./types";

export default Vue.extend({
  name: "Items",
  props: {
    items: Array as PropType<IPackedBox[]>,
  },
  data: (): IItemsTypes => ({
    filter: null,
    currentItems: [],
    settings: {
      suppressScrollX: true,
      wheelPropagation: false,
    },
  }),
  watch: {
    items: function () {
      this.filterItems();
    },
    filter: function () {
      this.filterItems();
    },
  },
  methods: {
    filterItems: function () {
      switch (this.filter) {
        case null:
          this.currentItems = this.items;
          break;
        case "packed":
          this.currentItems = this.items.filter(
            (item) => item.packed && item.packed === true
          );
          break;
        case "not_packed":
          this.currentItems = this.items.filter(
            (item) => !item.packed || (item.packed && item.packed !== true)
          );
          break;
      }
    },
  },
  mounted() {
    this.currentItems = this.items;
  },
});
</script>

<style scoped>
.scroll {
  height: 45vh;
}

.box {
  height: 20px;
  min-width: 40px;
  border: 1px solid black;
}

.item::after {
  content: "";
  display: block;
  width: 100%;
  top: 50%;
  left: 0;
  height: 1px;
  position: absolute;
  background: #c00;
}
</style>