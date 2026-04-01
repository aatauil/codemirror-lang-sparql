import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import {lezer} from "@lezer/generator/rollup"

const external = id => !/^(\.?\/|\w:)/.test(id)

export default [
  {
    input: "src/index.ts",
    external,
    output: [
      {file: "dist/index.cjs", format: "cjs"},
      {dir: "./dist", format: "es"}
    ],
    plugins: [lezer(), typescript()]
  },
  {
    input: "src/index.ts",
    external,
    output: [{file: "dist/index.d.ts", format: "es"}],
    plugins: [dts()]
  }
]
