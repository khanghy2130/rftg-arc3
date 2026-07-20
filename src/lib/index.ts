export interface World {
  color: "GRAY" | "BLUE" | "BROWN" | "GREEN" | "YELLOW";
  isMilitary?: boolean;
  isWindfall?: boolean;
  type?: "START_BLUE" | "START_RED" | "NEAR" | "FAR";
}

export type Power = "I" | "II" | "III" | "$" | "IV" | "V";
export type Keyword =
  | "CHROMOSOME"
  | "ANTI-XENO"
  | "XENO"
  | "UPLIFT"
  | "REBEL"
  | "IMPERIUM"
  | "ALIEN"
  | "TERRAFORMING";

export interface Card {
  src: string;
  name: string;
  keywords: Keyword[];
  cost: number;
  vp: number | "?";
  powers: Power[];
  world?: World;
}
