import {
  canRunWasmModel,
  LLM_MODELS,
  pickWasmModel,
  detectDeviceTier,
  pickDefaultModel,
  WASM_LLM_MODELS,
  type DeviceCapabilities,
} from "@/lib/llm/models";

function caps(partial: Partial<DeviceCapabilities>): DeviceCapabilities {
  return {
    deviceMemoryGB: null,
    hardwareConcurrency: null,
    isMobile: false,
    ...partial,
  };
}

describe("detectDeviceTier", () => {
  it("maps deviceMemory to the hardware guide tiers", () => {
    expect(detectDeviceTier(caps({ deviceMemoryGB: 2 }))).toBe("tiny");
    expect(detectDeviceTier(caps({ deviceMemoryGB: 4 }))).toBe("small");
    expect(detectDeviceTier(caps({ deviceMemoryGB: 8 }))).toBe("medium");
    expect(detectDeviceTier(caps({ deviceMemoryGB: 16 }))).toBe("large");
  });

  it("defaults to small when deviceMemory is unavailable", () => {
    expect(detectDeviceTier(caps({}))).toBe("small");
  });

  it("downgrades one tier on mobile devices", () => {
    expect(detectDeviceTier(caps({ deviceMemoryGB: 8, isMobile: true }))).toBe(
      "small",
    );
  });

  it("downgrades one tier on weak CPUs", () => {
    expect(
      detectDeviceTier(caps({ deviceMemoryGB: 8, hardwareConcurrency: 4 })),
    ).toBe("small");
  });

  it("never goes below tiny", () => {
    expect(
      detectDeviceTier(
        caps({ deviceMemoryGB: 1, isMobile: true, hardwareConcurrency: 2 }),
      ),
    ).toBe("tiny");
  });
});

describe("pickDefaultModel", () => {
  it("picks the catalog model matching the detected tier", () => {
    expect(pickDefaultModel(caps({ deviceMemoryGB: 16 })).modelId).toContain(
      "Llama-3.2-3B",
    );
    expect(pickDefaultModel(caps({ deviceMemoryGB: 2 })).modelId).toContain(
      "SmolLM2-360M",
    );
  });

  it("catalog tiers map to the four documented devices", () => {
    expect(LLM_MODELS.map((m) => m.tier)).toEqual([
      "tiny",
      "small",
      "medium",
      "large",
    ]);
  });
});

describe("pickWasmModel", () => {
  it("selects a smaller model for constrained devices", () => {
    expect(
      pickWasmModel(caps({ deviceMemoryGB: 4, hardwareConcurrency: 4 }))
        ?.modelId,
    ).toBe("onnx-community/Qwen2.5-0.5B-Instruct");
  });

  it("selects the larger WASM model only when memory and CPU allow it", () => {
    expect(
      pickWasmModel(caps({ deviceMemoryGB: 16, hardwareConcurrency: 8 }))
        ?.modelId,
    ).toBe("onnx-community/Qwen2.5-1.5B-Instruct");
    expect(
      pickWasmModel(caps({ deviceMemoryGB: 8, hardwareConcurrency: 4 }))
        ?.modelId,
    ).toBe("onnx-community/Qwen2.5-0.5B-Instruct");
  });

  it("rejects models when reported device limits are too low", () => {
    expect(
      canRunWasmModel(
        WASM_LLM_MODELS[0],
        caps({ deviceMemoryGB: 2, hardwareConcurrency: 2 }),
      ),
    ).toBe(false);
    expect(
      pickWasmModel(caps({ deviceMemoryGB: 2, hardwareConcurrency: 2 })),
    ).toBeUndefined();
  });

  it("does not guess when both hardware signals are unavailable", () => {
    expect(pickWasmModel(caps({}))).toBeUndefined();
  });

  it("keeps the larger model gated when either hardware signal is missing", () => {
    expect(
      canRunWasmModel(
        WASM_LLM_MODELS[1],
        caps({ deviceMemoryGB: 16, hardwareConcurrency: null }),
      ),
    ).toBe(false);
    expect(
      pickWasmModel(caps({ deviceMemoryGB: 16, hardwareConcurrency: null }))
        ?.modelId,
    ).toBe("onnx-community/Qwen2.5-0.5B-Instruct");
  });
});
