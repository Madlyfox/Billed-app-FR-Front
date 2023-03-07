import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    const buttonNewBill = this.document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");

    if (billUrl.split("/").includes("null")) {
      alert(
        "Impossible d'aficher cette image car l'extension du fichier n'est pas supporté"
      );
    } else {
      const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
      $("#modaleFile")
        .find(".modal-body")
        .html(
          `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
        );
      $("#modaleFile").modal("show");
    }
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          let bills = snapshot.map((doc) => {
            try {
              return {
                ...doc,
                date: doc.date,
                status: doc.status,
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, "for", doc);
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status),
              };
            }
          });

          //empeche de creer des billets fantome lors des tests
          const debugFilter = [];
          bills.forEach((bill) => {
            if (bill.name) {
              debugFilter.push(bill);
            }
          });

          bills = debugFilter;

          bills.sort((a, b) => (a.date < b.date ? 1 : -1));

          return bills;
        });
    }
  };
}
