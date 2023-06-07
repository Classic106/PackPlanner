<template>
  <div class="d-flex flex-column my-2">
    <div class="row m-0 px-2">
      <div
        class="row m-0 w-100 row justify-content-sm-center justify-content-lg-end p-0"
      >
        <div class="row m-0">
          <button v-on:click="randomBoxes" class="btn btn-primary mr-1 mb-1">
            Random boxes
          </button>
          <button v-on:click="randomPacks" class="btn btn-primary mr-1 mb-1">
            Random packs
          </button>
        </div>
        <div class="d-flex flex-column position-relative">
          <button
            v-on:click="isPersentage = !isPersentage"
            class="btn btn-primary mr-1 mb-1"
          >
            Persentage
          </button>
          <ul
            :class="isPersentage ? 'd-flex ' : 'd-none'"
            class="w-100 flex-column position-absolute p-0 m-0"
          >
            <li v-on:click="persentage = 10" class="text-center">10</li>
            <li v-on:click="persentage = 15" class="text-center">15</li>
            <li v-on:click="persentage = 20" class="text-center">20</li>
            <li v-on:click="persentage = 25" class="text-center">25</li>
          </ul>
        </div>
        <div class="d-flex flex-column position-relative">
          <button
            v-on:click="isVariants = !isVariants"
            class="btn btn-primary text-center"
          >
            {{ activeVariant ? activeVariant : "Variants" }}
          </button>
          <ul
            :class="isVariants ? 'd-flex' : 'd-none'"
            class="w-100 flex-column position-absolute p-0 m-0"
          >
            <li
              :class="
                sameVolumes.length && activeVariant !== 'Same'
                  ? 'd-flex'
                  : 'd-none'
              "
              class="text-center p-1"
              v-on:click="setVariant('same')"
            >
              Same box
            </li>
            <li
              :class="
                upperVolumes.length && activeVariant !== 'Upper'
                  ? 'd-flex'
                  : 'd-none'
              "
              class="text-center p-1"
              v-on:click="setVariant('upper')"
            >
              Upper box
            </li>
            <li
              :class="
                equalsVolumes.length && activeVariant !== 'Equals'
                  ? 'd-flex'
                  : 'd-none'
              "
              class="text-center p-1"
              v-on:click="setVariant('equals')"
            >
              Equals boxes
            </li>
            <li
              :class="
                combineVolumes.length && activeVariant !== 'Combines'
                  ? 'd-flex'
                  : 'd-none'
              "
              class="text-center p-1"
              v-on:click="setVariant('combines')"
            >
              Combine boxes
            </li>
          </ul>
        </div>
      </div>
    </div>
    <PlannerVisual
      :variant="variant"
      :items="currentItems"
      v-on:upPersentage="() => {}"
      class="mt-4 p-2"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";

import { IBox, EDimension, EWeight_dimension } from "~/types";
import { IIndexTypes } from "./types";
import { convertSizes, randomIntFromInterval } from "~/utils/functions";

import PlannerVisual from "./PlannerVisual/index.vue";

export default Vue.extend({
  name: "PackagePlanner",
  components: { PlannerVisual },
  data: (): IIndexTypes => ({
    isVariants: false,
    activeVariant: "",
    isPersentage: false,
    middles: {
      midH: 0,
      midW: 0,
      midL: 0,
      midWeight: 0,
    },
    maximums: {
      maxH: 0,
      maxW: 0,
      maxL: 0,
      maxWeight: 0,
    },
    variant: null,
    currentItems: [],
    currentBoxes: [],
    persentage: 10,
    totalWeight: 0,
    totalVolume: 0,
    sameVolumes: [],
    upperVolumes: [],
    equalsVolumes: [],
    combineVolumes: [],
  }),
  computed: {
    ...mapGetters({
      packs: "packs",
      boxes: "boxes",
    }),
  },
  watch: {
    persentage: function () {
      this.init();
    },
    boxes: function () {
      this.init();
    },
    packs: function () {
      this.init();
    },
  },
  methods: {
    convertSizes,
    randomIntFromInterval,
    ...mapActions({
      getBoxes: "getBoxes",
      getPacks: "getPacks",
    }),
    random_Boxes: function (to: number = 250, pack?: Boolean): IBox[] {
      const boxes = [] as IBox[];

      for (let i = 1; i < to; i++) {
        const { cm, inch } = EDimension;
        const { kilo, lbs } = EWeight_dimension;

        const from = pack ? 1 : 5;
        const to = pack ? 5 : 15;

        const random = Math.round(Math.random());

        const id = `${i}_${pack ? "pack" : "box"}`;
        const width = randomIntFromInterval(from, to);
        const height = randomIntFromInterval(from, to);
        const lengthy = randomIntFromInterval(from, to);
        const weight = randomIntFromInterval(from * 10, to * 10);
        const volume = width * lengthy * height;

        const dimension = random ? inch : cm;
        const weight_dimension = random ? kilo : lbs;

        boxes.push({
          id,
          width,
          lengthy,
          height,
          volume,
          weight,
          dimension,
          weight_dimension,
        });
      }

      return boxes;
    },
    randomBoxes: function () {
      const to = randomIntFromInterval(1, 10);
      const boxes = this.random_Boxes(to);

      this.$store.commit("set_boxes", boxes);
    },
    randomPacks: function () {
      const to = randomIntFromInterval(1, 50);
      const packs = this.random_Boxes(to, true);

      this.$store.commit("set_packs", packs);
    },
    setVariant: function (variant: string) {
      const { sameVolumes, upperVolumes, equalsVolumes, combineVolumes } = this;

      switch (variant) {
        case "same":
          this.activeVariant = "Same";
          this.variant = sameVolumes;
          break;
        case "upper":
          this.activeVariant = "Upper";
          this.variant = upperVolumes;
          break;
        case "equals":
          this.activeVariant = "Equals";
          this.variant = equalsVolumes[0];
          break;
        case "combines":
          this.activeVariant = "Combine";
          this.variant = combineVolumes;
          break;
      }
    },
    setMaxs: function (item: IBox) {
      //set maximal for search box
      const { height, width, lengthy, weight } = item;
      const { maxH, maxW, maxL, maxWeight } = this.maximums;

      if (maxH < height) {
        this.maximums.maxH = height;
      }

      if (maxW < width) {
        this.maximums.maxW = width;
      }

      if (maxL < lengthy) {
        this.maximums.maxL = lengthy;
      }

      if (maxWeight < weight) {
        this.maximums.maxWeight = weight;
      }
    },
    middleSizes: function (items: IBox[]) {
      const result = items.reduce(
        (acc, item) => {
          acc.midH += item.height;
          acc.midW += item.width;
          acc.midL += item.lengthy;
          acc.midWeight += item.weight;

          return acc;
        },
        {
          midH: 0,
          midW: 0,
          midL: 0,
          midWeight: 0,
        }
      );

      if (items.length) {
        const { midH, midW, midL, midWeight } = result;
        const { length } = items;

        this.middles = {
          midH: Math.ceil(midH / length),
          midW: Math.ceil(midW / length),
          midL: Math.ceil(midL / length),
          midWeight: Math.ceil(midWeight / length),
        };
      }
    },
    calculateItemsTotals: function (items: IBox[]) {
      const { totalWeight, totalVolume } = items.reduce(
        (acc, item) => {
          const { totalWeight, totalVolume } = acc;
          const data = {
            totalWeight: totalWeight + item.weight,
            totalVolume: totalVolume + item.volume,
          };
          return data;
        },
        { totalWeight: 0, totalVolume: 0 }
      );

      this.totalWeight = totalWeight;
      this.totalVolume = totalVolume;
    },
    calcPersentage: function (d: number) {
      const { persentage } = this;
      return (+d / 100) * persentage;
    },
    sortByVolume: function (a: IBox, b: IBox) {
      if (a.volume < b.volume) {
        return -1;
      }
      if (a.volume > b.volume) {
        return 1;
      }
      return 0;
    },
    checkMaximums: function (box: IBox) {
      //check if can fit biggest item in box
      const { height, width, lengthy, weight } = box;
      const { maxH, maxW, maxL, maxWeight } = this.maximums;

      const isWeight = weight >= maxWeight;

      const checkValues_lenghtAsHeight =
        lengthy >= maxH && width >= maxW && height >= maxL;

      if (checkValues_lenghtAsHeight && isWeight) {
        return true;
      }

      const checkValues_widthAsHeight =
        width >= maxH && height >= maxW && lengthy >= maxL;

      if (checkValues_widthAsHeight && isWeight) {
        return true;
      }

      const checkValue_widthAsLenght =
        height >= maxH && lengthy >= maxW && width >= maxL;

      if (checkValue_widthAsLenght && isWeight) {
        return true;
      }

      const checkValues_widthAsHeight_heightAsLenght =
        width >= maxH && lengthy >= maxW && height >= maxL;

      if (checkValues_widthAsHeight_heightAsLenght && isWeight) {
        return true;
      }

      const checkValues_lenghtAsHeight_heightAsWidth =
        lengthy >= maxH && height >= maxW && width >= maxL;

      if (checkValues_lenghtAsHeight_heightAsWidth && isWeight) {
        return true;
      }

      const checkValues_same =
        height >= maxH && width >= maxW && lengthy >= maxL;
      if (checkValues_same && isWeight) {
        return true;
      }
    },
    checkBox: function (box: IBox) {
      //checking if the box has same or bigger size
      const { height, width, lengthy, weight } = box;
      const { midH, midW, midL, midWeight } = this.middles;

      const max = Math.max(midH, midW, midL);

      const isH = height >= max;
      const isW = width >= max;
      const isL = lengthy >= max;
      const isWeight = weight >= midWeight;

      return isH && isW && isL && isWeight;
    },
    findBoxes: function () {
      const {
        totalVolume,
        persentage,
        currentBoxes,
        checkBox,
        sortByVolume,
        checkMaximums,
        calcPersentage,
      } = this;

      if (totalVolume === 0) {
        return;
      }

      const sameVolume = currentBoxes.filter(
        (box) =>
          totalVolume < box.volume &&
          totalVolume >= box.volume - calcPersentage(box.volume) &&
          checkMaximums(box)
      );

      const upperVolume = currentBoxes
        .filter(
          (box) =>
            box.volume > totalVolume + calcPersentage(box.volume) &&
            checkMaximums(box)
        )
        .reverse();

      const { equalsCombines, combines } = findCombineVolumes(
        currentBoxes,
        totalVolume,
        persentage
      );

      if (upperVolume.length) {
        this.upperVolumes = [upperVolume[0]];
      }
      this.sameVolumes = sameVolume;
      this.equalsVolumes = equalsCombines;
      this.combineVolumes = combines;

      return;

      function findCombineVolumes(
        boxes: IBox[],
        totalVolume: number,
        persentage = 30
      ) {
        const lessBoxes = boxes
          .filter((box, index) => {
            if (index === 0) {
              return box.volume < totalVolume && checkMaximums(box);
            }
            return box.volume < totalVolume && checkBox(box);
          })
          .sort((a, b) => sortByVolume(b, a));

        const equalsCombines = [] as IBox[][];
        const combines = [] as IBox[];

        if (!lessBoxes.length) {
          return { equalsCombines, combines };
        }

        //find equals boxes combinations for pack
        for (let i = 0; i < lessBoxes.length; i++) {
          if (checkMaximums(lessBoxes[i])) {
            const count = totalVolume / lessBoxes[i].volume;
            const rest = +((totalVolume / lessBoxes[i].volume) % 1).toFixed(1);
            const isNear = rest + (persentage / 100 - 1);
            //isNear is value that shows that the remainder is close to an integer
            if (rest === 1 || isNear === 0) {
              const boxes = new Array(Math.ceil(count)).fill(
                lessBoxes[i]
              ) as IBox[];
              equalsCombines.push(boxes);
            }
          }
        }

        //find boxes combinations for pack
        const items = [] as IBox[];
        let currentTotalVolume = totalVolume;

        for (let i = 1; i < lessBoxes.length; i++) {
          if (currentTotalVolume <= 0) {
            break;
          }

          if (i === 1) {
            const vol = lessBoxes[0].volume + lessBoxes[1].volume;
            items.push(lessBoxes[0]);
            items.push(lessBoxes[1]);
            currentTotalVolume -= vol;
            continue;
          }

          items.push(lessBoxes[i]);
          currentTotalVolume -= lessBoxes[i].volume;
        }

        return {
          equalsCombines: equalsCombines.reverse(),
          combines: items,
        };
      }
    },
    init: function () {
      this.currentItems = [...(this.packs as IBox[])].map((item) => {
        const box = this.convertSizes(item);
        this.setMaxs(box);
        return item;
      });

      this.currentBoxes = [...(this.boxes as IBox[])]
        .map((box) => this.convertSizes(box))
        .sort((a, b) => this.sortByVolume(b, a));

      this.calculateItemsTotals(this.currentItems);
      this.middleSizes(this.currentItems);
      this.findBoxes();
      this.maximums;
      this.middles;

      if (this.sameVolumes.length) {
        this.setVariant("same");
        return;
      }

      if (this.equalsVolumes.length) {
        this.setVariant("equals");
        return;
      }

      if (this.upperVolumes.length) {
        this.setVariant("upper");
        return;
      }

      if (this.combineVolumes.length) {
        this.setVariant("combines");
        return;
      }
    },
  },
  async mounted() {
    if (!this.packs.length) {
      await this.getPacks();
    }
    if (!this.boxes.length) {
      await this.getBoxes();
    }
    this.init();
  },
});
</script>

<style scoped>
ul {
  top: 100%;
  z-index: 1;
  border-radius: 5px;
  background-color: white;
}
</style>