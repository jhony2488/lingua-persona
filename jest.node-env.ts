import { TestEnvironment } from "jest-environment-node";
import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from "@jest/environment";

/**
 * Ambiente node com os globals nativos do fetch (Node 18+) injetados no
 * sandbox do Jest — a env padrão não os expõe. Evita depender do pacote
 * `undici`, que é resolvido para uma versão transitiva incompatível com
 * o runtime em uso.
 */
export default class NodeFetchEnvironment extends TestEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    Object.assign(this.global, {
      fetch,
      Headers,
      Request,
      Response,
    });
  }
}
