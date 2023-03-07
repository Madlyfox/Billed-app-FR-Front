/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import jQuery from "jquery";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      bills.sort((a, b) => (a.date < b.date ? 1 : -1));
      document.body.innerHTML = BillsUI({ data: bills });

      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
    describe("When i click on AddBill Button", () => {
      test("then i should be redirected to AddBill page", async () => {
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = null;

        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage,
        });

        expect(bill.handleClickNewBill).toBeTruthy();

        const newBill = screen.getByTestId("btn-new-bill");

        const handleClickNewBill = jest.fn(bill.handleClickNewBill);
        newBill.addEventListener("click", handleClickNewBill);
        fireEvent.click(newBill);
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });
    describe("When I click on the Eye Button", () => {
      test("should Then I shoul be able to see bill img", () => {
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        jQuery.fn.modal = () => {};

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = null;

        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage,
        });

        expect(bill.handleClickIconEye).toBeTruthy();

        const handleClickIconEye = jest.fn(bill.handleClickIconEye);

        const iconEyes = screen.getAllByTestId("icon-eye");
        iconEyes.forEach((eye) => {
          eye.addEventListener("click", handleClickIconEye(eye));
        });

        fireEvent.click(iconEyes[1]);

        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });
  });
});

// Test d'integration GET

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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
