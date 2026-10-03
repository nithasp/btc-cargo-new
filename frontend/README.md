# BTC Cargo - Freight Management System

A dynamic and modern frontend for a **Freight Management and Tracking System** built with Angular. This Single-Page Application (SPA) provides a complete user interface for managing logistics operations, including order processing, shipment tracking, and business analytics.

---

<p align="center">
  <a href="https://raw.githubusercontent.com/nithasp/btc-cargo/master/screenshots/sc2.png" target="_blank">
    <img src="screenshots/sc2.png" width="100%" hspace="5" />
  </a>
</p>

---

## Features

-   **Dashboard Overview:** A central hub displaying key performance indicators (KPIs) like total orders, delivered shipments, and revenue, providing an at-a-glance view of business health.
-   **Comprehensive Order Management:** Full CRUD (Create, Read, Update, Delete) functionality for managing the entire lifecycle of cargo orders through an intuitive and responsive interface.
-   **Interactive Shipment Tracking:** A dedicated tracking feature that allows users to search for orders and monitor their status through a clear, visual pipeline, simulating real-world logistics stages from "Booked" to "In Transit" to "Delivered."

## Tech Stack

-   **Framework:** Angular
-   **Language:** TypeScript
-   **State Management:** RxJS Observables & Angular Services
-   **Routing:** Angular Router
-   **Styling:** CSS3
-   **Build Tool:** Angular CLI

## Installation & Setup

Follow these steps to get the development environment running on your local machine.

### Prerequisites

-   Ensure you have **Node.js** (which includes npm) installed on your system.
-   Ensure you have the **Angular CLI** installed globally.
    ```bash
    npm install -g @angular/cli
    ```

> **Note on Node.js versions.** This project targets Angular 11, whose build
> pipeline runs on webpack 4. webpack 4 hashes with MD4, which OpenSSL 3
> (bundled with Node 17 and newer) disables by default. The `npm` scripts in
> this repo therefore launch the Angular CLI with `--openssl-legacy-provider`,
> which keeps the project building on current Node releases. Run the project
> through those scripts rather than invoking a global `ng` directly.

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nithasp/btc-cargo.git
    cd btc-cargo
    ```

2.  **Install all required dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```
    The `--legacy-peer-deps` flag is required. npm 7 and newer enforce peer
    dependencies strictly, and this project pins `zone.js@0.10.2` while
    `@angular/core@11.0.5` asks for `~0.10.3`; a plain `npm install` stops
    with an `ERESOLVE` error.

3.  **Run the development server:**
    ```bash
    npm start
    ```
    Use `npm start` rather than a bare `ng serve`: the npm script passes the
    `--openssl-legacy-provider` flag that webpack 4 needs on modern Node. A
    global `ng serve` will fail with `ERR_OSSL_EVP_UNSUPPORTED`.

    To produce a production bundle:
    ```bash
    npm run build
    ```

4.  **Open your browser:**
    Navigate to `http://localhost:4200`. The application will automatically reload if you change any source file.
