import { IBox, EDimension, EWeight_dimension } from "~/types";

export function convertSizes<T extends IBox>(box: T): T {
  let sizes = {};

  if (box.dimension === "inch") {
    const width = box.width * 2.54;
    const lengthy = box.lengthy * 2.54;
    const height = box.height * 2.54;
    const volume = width * lengthy * height;
    const dimension = EDimension.cm;

    sizes = { width, lengthy, height, volume, dimension };
  }

  if (box.weight_dimension === "lbs") {
    const weight = box.weight * 0.453592;
    const weight_dimension = EWeight_dimension.kilo;

    sizes = { ...sizes, weight, weight_dimension };
  }

  return { ...box, ...sizes };
}

export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
