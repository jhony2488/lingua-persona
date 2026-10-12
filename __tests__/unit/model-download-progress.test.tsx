import { render, screen } from "@testing-library/react";
import { ModelDownloadProgress } from "@/components/model-download-progress";
import { dictionary } from "@/i18n/dictionaries/en-US";
import { I18nProvider } from "@/i18n/provider";
import { useLLMStore } from "@/lib/llm/store";

function renderProgress() {
  return render(
    <I18nProvider locale="en-US" dict={dictionary}>
      <ModelDownloadProgress />
    </I18nProvider>,
  );
}

describe("ModelDownloadProgress", () => {
  afterEach(() => {
    useLLMStore.setState({
      status: "idle",
      progress: 0,
      progressText: "",
      engine: null,
      modelId: null,
    });
  });

  it("shows the model and remaining percentage on any page", () => {
    useLLMStore.setState({
      status: "downloading",
      progress: 0.72,
      progressText: "Downloading ONNX weights",
      modelId: "onnx-community/Qwen2.5-0.5B-Instruct",
    });

    renderProgress();

    expect(screen.getByText(/Qwen 2.5 0.5B \(WASM\)/)).toHaveTextContent(
      "28% remaining",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "72",
    );
  });

  it("stays hidden when no model is downloading", () => {
    useLLMStore.setState({ status: "ready" });
    renderProgress();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});