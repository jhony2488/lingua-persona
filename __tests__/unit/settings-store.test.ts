import { useSettings } from "@/lib/store/settings";

describe("settings store", () => {
  it("has sensible defaults", () => {
    const state = useSettings.getState();
    expect(state.dialect).toBe("US");
    expect(state.level).toBe("A1");
    expect(state.agentName).toBe("Alex");
    expect(state.userId).toBeNull();
  });

  it("updates settings", () => {
    useSettings.getState().setDialect("UK");
    useSettings.getState().setLevel("B2");
    expect(useSettings.getState().dialect).toBe("UK");
    expect(useSettings.getState().level).toBe("B2");
  });
});
