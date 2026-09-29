import {
  LLM_MODELS,
  detectDeviceTier,
  pickDefaultModel,
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
