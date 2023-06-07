import { ActionTree, MutationTree, GetterTree } from "vuex";
import { IBox } from "~/types";

import { error } from "~/utils/error";

import { boxes } from "~/static/boxes_examples";
import { packs } from "~/static/packs_examples";

interface IState {
  boxes: IBox[];
  packs: IBox[];
}

type RootState = ReturnType<typeof state>;

export const state = (): IState => ({
  boxes: [],
  packs: [],
});

export const actions: ActionTree<RootState, RootState> = {
  async getBoxes({ commit }) {
    try {
      commit("set_boxes", boxes);
    } catch (e) {
      error(e as Error);
    }
  },
  async getPacks({ commit }) {
    try {
      commit("set_packs", packs);
    } catch (e) {
      error(e as Error);
    }
  },
};

export const mutations: MutationTree<RootState> = {
  set_boxes(state: IState, boxes = []) {
    state.boxes = boxes;
  },
  set_packs(state: IState, packs = []) {
    state.packs = packs;
  },
};

export const getters: GetterTree<RootState, RootState> = {
  boxes(state: IState) {
    return state.boxes;
  },
  packs(state: IState) {
    return state.packs;
  },
};
