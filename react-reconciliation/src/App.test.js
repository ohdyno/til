import { render, screen } from "@testing-library/react";
import React, { useCallback, useState } from "react";
import userEvent from "@testing-library/user-event";

describe("react reconciliation", () => {
  it(
    "when inner component is defined inside the component," +
      "on rerender, inner component is rebuilt from scratch (unmounted) because it's redefined on rerender",
    async () => {
      const Wrapper = () => {
        const [state, updateState] = useState("before");
        const Inner = ({ state, handleClick }) => (
          <div>
            <button data-testid="button" onClick={handleClick}>
              {state}
            </button>
          </div>
        );
        const handleClick = () => updateState("after");
        return <Inner state={state} handleClick={handleClick} />;
      };

      render(<Wrapper />);

      const button = await screen.findByTestId("button");
      userEvent.click(button);

      expect(await screen.findByText("after")).toBeDefined();
      expect(button).toBeInTheDocument();
    }
  );

  it(
    "inner component defined through useCallback is not rebuilt from scratch because it is stored by react state " +
      "and react is able to tell that the inner component is the same component across rendering",
    async () => {
      const Wrapper = () => {
        const [state, updateState] = useState("before");
        const Inner = useCallback(
          ({ state, handleClick }) => (
            <div>
              <button data-testid="button" onClick={handleClick}>
                {state}
              </button>
            </div>
          ),
          []
        );

        const handleClick = () => updateState("after");
        return <Inner state={state} handleClick={handleClick} />;
      };

      render(<Wrapper />);

      const button = await screen.findByTestId("button");
      userEvent.click(button);

      expect(await screen.findByText("after")).toBeDefined();
      expect(button).toBeInTheDocument();
    }
  );

  it(
    "when the 'inner' component is defined outside of the component, the inner component is the same across" +
      " renderings and therefore is not torn down unnecessarily",
    async () => {
      const Inner = ({ state, handleClick }) => (
        <div>
          <button data-testid="button" onClick={handleClick}>
            {state}
          </button>
        </div>
      );
      const Wrapper = () => {
        const [state, updateState] = useState("before");
        const handleClick = () => updateState("after");
        return <Inner state={state} handleClick={handleClick} />;
      };

      render(<Wrapper />);

      const button = await screen.findByTestId("button");
      userEvent.click(button);

      expect(await screen.findByText("after")).toBeDefined();
      expect(button).toBeInTheDocument();
    }
  );
});
