import "dotenv/config";
import { runIntakeInterpreter } from "../agents/intake-interpreter/index.js";
import { runESIEvaluator } from "../agents/clinical-grounder/index.js";

const inputs = [
  // "He is choking and gasping but also making weird noises like he's drowning",
  // "My father is gasping for air and he feels weird and dizzy"
  // "He collapsed, stopped responding, and his lips turned blue"
  // "He is breathing very fast and struggling to talk",
  // "He feels like his heart is racing and skipping beats",
  // "He is gasping",
  // "He is gasping and has chest pressure",
  "I am having sore throat and a mild fever"
];
async function main() {
  for (const input of inputs) {
    const result = await runIntakeInterpreter({
      transcript: input,
      selectedObservables: []
    });

    console.log(input, " -", JSON.stringify(result, null, 2));
    const resultAgent2 = await runESIEvaluator(result);

    console.log(input, " -", JSON.stringify(resultAgent2, null, 2));
  }
}

main().catch(console.error);
