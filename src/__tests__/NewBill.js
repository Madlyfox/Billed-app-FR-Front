/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import userEvent from "@testing-library/user-event";
import router from "../app/Router";
import Store from "../app/Store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I should be able submit a file", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
          status: "connected",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const input = screen.getByTestId("file");

      const store = Store;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const file = new File(["hello"], "hello.png", {
        name: "Capture d’écran 2022-09-23 175246.png",
        lastModified: 1663948368037,
        webkitRelativePath: "",
        size: 6383,
        type: "image/png",
      });

      const handleChangeFile = jest.fn();

      input.addEventListener("change", handleChangeFile);
      userEvent.upload(input, file);

      expect(handleChangeFile).toBeCalled();
    });
    test("Then I should be able fill a new bill form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
          status: "connected",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = null;
      const form = screen.getByTestId("form-new-bill");

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      expect(newBill.handleSubmit).toBeTruthy();

      const handleSubmit = jest.fn(newBill.handleSubmit);

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });

    describe("when the form is corectly filled ", () => {
      test("should Then I should be redirected to bill Page", () => {
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetchs bills fom mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
});
