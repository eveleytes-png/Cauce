"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileUp,
  Image as ImageIcon,
  ListFilter,
  Menu,
  Minus,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ORDERS } from "@/constants/orders";
import {
  buildChartSeries,
  currentMonthSales,
  formatARS,
  formatCompactARS,
  formatOrderDate,
  last12MonthsSales,
  last3MonthsCaption,
  monthName,
  productCount,
  topSoldProducts,
  type ChartSeries,
  type MonthSales,
  type Order,
} from "@/lib/sales";

const navItems = [
  ["Inicio", "/"],
  ["Notas de Pedido", "/notas-de-pedido"],
  ["Clientes", "/clientes"],
  ["Proveedores", "/proveedores"],
  ["Productos", "/productos"],
] as const;

type Contact = {
  id: string;
  businessName: string;
  name: string;
  cuit: string;
  latLng: string;
  note: string;
  phone: string;
  email: string;
};

type ContactKind = "cliente" | "proveedor";

const emptyContact = (): Contact => ({
  id: "",
  businessName: "",
  name: "",
  cuit: "",
  latLng: "",
  note: "",
  phone: "",
  email: "",
});

const INITIAL_CLIENTS: Contact[] = [
  {
    id: "cli-1",
    businessName: "Constructora Andina",
    name: "María González",
    cuit: "30-71234567-1",
    latLng: "-34.6037, -58.3816",
    note: "",
    phone: "+54 11 4580 2200",
    email: "maria@andina.com",
  },
  {
    id: "cli-2",
    businessName: "Almacén El Roble",
    name: "Pedro López",
    cuit: "20-28456123-4",
    latLng: "-34.7051, -58.2784",
    note: "",
    phone: "+54 11 4580 2201",
    email: "pedro@elroble.com",
  },
  {
    id: "cli-3",
    businessName: "Obras del Sur",
    name: "Ana Martínez",
    cuit: "30-69874521-9",
    latLng: "-34.8123, -58.3910",
    note: "",
    phone: "+54 11 4580 2202",
    email: "ana@obrasdelsur.com",
  },
  {
    id: "cli-4",
    businessName: "Ferretería Central",
    name: "Luis Fernández",
    cuit: "27-30567891-2",
    latLng: "-34.5990, -58.4321",
    note: "",
    phone: "+54 11 4580 2203",
    email: "luis@ferreteriacentral.com",
  },
  {
    id: "cli-5",
    businessName: "Boutique La Esquina",
    name: "Sofía Pérez",
    cuit: "27-40123456-8",
    latLng: "-34.5880, -58.4012",
    note: "",
    phone: "+54 11 4580 2204",
    email: "sofia@laesquina.com",
  },
  {
    id: "cli-6",
    businessName: "Obra Nueva",
    name: "Diego Romero",
    cuit: "20-35678901-3",
    latLng: "-34.6501, -58.5120",
    note: "",
    phone: "+54 11 4580 2205",
    email: "diego@obranueva.com",
  },
  {
    id: "cli-7",
    businessName: "Casa Roca",
    name: "Carla Méndez",
    cuit: "27-38901234-5",
    latLng: "-34.7210, -58.2633",
    note: "",
    phone: "+54 11 4580 2206",
    email: "carla@casaroca.com",
  },
];

const INITIAL_PROVIDERS: Contact[] = [
  {
    id: "prv-1",
    businessName: "Cementos del Sur",
    name: "Jorge Ramírez",
    cuit: "30-50123456-7",
    latLng: "-34.7201, -58.2504",
    note: "",
    phone: "+54 11 4300 1100",
    email: "jorge@cementosdelsur.com",
  },
  {
    id: "prv-2",
    businessName: "Distribuidora Norte",
    name: "Laura Vega",
    cuit: "30-61234567-8",
    latLng: "-34.5412, -58.4890",
    note: "",
    phone: "+54 11 4300 1101",
    email: "laura@dnorte.com",
  },
  {
    id: "prv-3",
    businessName: "Materiales Roca",
    name: "Martín Soto",
    cuit: "30-72345678-9",
    latLng: "-34.6688, -58.3511",
    note: "",
    phone: "+54 11 4300 1102",
    email: "martin@materialesroca.com",
  },
  {
    id: "prv-4",
    businessName: "Logística del Plata",
    name: "Elena Duarte",
    cuit: "30-83456789-0",
    latLng: "-34.6102, -58.3720",
    note: "",
    phone: "+54 11 4300 1103",
    email: "elena@logisticadelplata.com",
  },
];
const PRODUCT_CATALOG = [
  { id: "cem-025", name: "Cemento especial 25 kg", provider: "Cementos del Sur", code: "CEM-025", price: 18500 },
  { id: "osb-011", name: "Plancha OSB 11 mm", provider: "Cementos del Sur", code: "OSB-011", price: 4250 },
  { id: "pvc-110", name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", code: "PVC-110", price: null },
  { id: "acm-092", name: "Malla Acma C-92", provider: "Materiales Roca", code: "ACM-092", price: 12500 },
];

type DraftLine = { id: string; name: string; provider: string; qty: number };

function toDraftLines(lines: Order["lines"]): DraftLine[] {
  return lines.map((line) => {
    const match = PRODUCT_CATALOG.find((item) => item.name === line.name);
    return {
      id: match?.id ?? line.name,
      name: line.name,
      provider: line.provider,
      qty: line.qty,
    };
  });
}

function toOrderLines(lines: DraftLine[]): Order["lines"] {
  return lines.map((line) => ({ name: line.name, provider: line.provider, qty: line.qty }));
}

function linesAmount(lines: DraftLine[]) {
  return lines.reduce((sum, line) => {
    const price = PRODUCT_CATALOG.find((item) => item.id === line.id)?.price ?? 0;
    return sum + price * line.qty;
  }, 0);
}

function nextContactId(prefix: "cli" | "prv", items: Contact[]) {
  let max = 0;
  for (const item of items) {
    const n = Number.parseInt(item.id.replace(/^(cli|prv)-/, ""), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}-${max + 1}`;
}

function nextOrderId(orders: Order[]) {
  let max = 0;
  for (const order of orders) {
    const n = Number.parseInt(order.id.replace(/^NP-/, ""), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `NP-${String(max + 1).padStart(4, "0")}`;
}

type Section = "Inicio" | "Notas de Pedido" | "Clientes" | "Proveedores" | "Productos";
type ViewState = "data" | "empty" | "loading" | "error";
type DemoModal = "none" | "order" | "client" | "provider" | "import" | "export";
type ModalState = "empty" | "data" | "loading" | "error";

const VIEW_STATES: { id: ViewState; label: string }[] = [
  { id: "data", label: "Con datos" },
  { id: "empty", label: "Vacío" },
  { id: "loading", label: "Cargando" },
  { id: "error", label: "Error" },
];

const DEMO_WINDOWS: { id: DemoModal; label: string }[] = [
  { id: "none", label: "Ninguna" },
  { id: "order", label: "Nueva nota" },
  { id: "client", label: "Nuevo cliente" },
  { id: "provider", label: "Nuevo proveedor" },
  { id: "import", label: "Importar" },
  { id: "export", label: "Exportar" },
];

const MODAL_STATES: { id: ModalState; label: string }[] = [
  { id: "empty", label: "Vacío" },
  { id: "data", label: "Con datos" },
  { id: "loading", label: "Cargando" },
  { id: "error", label: "Error" },
];

const DEMO_ORDER_LINES: DraftLine[] = [
  { id: "cem-025", name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 12 },
  { id: "osb-011", name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 8 },
  { id: "pvc-110", name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 4 },
];

export default function HomePage() {
  const [section, setSection] = useState<Section>("Inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [clients, setClients] = useState<Contact[]>(INITIAL_CLIENTS);
  const [providers, setProviders] = useState<Contact[]>(INITIAL_PROVIDERS);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [notesStatuses, setNotesStatuses] = useState<string[]>([]);
  const [contactEditor, setContactEditor] = useState<{ kind: ContactKind; contact: Contact | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: ContactKind; contact: Contact } | null>(null);
  const [viewState, setViewState] = useState<ViewState>("data");
  const [demoModal, setDemoModal] = useState<DemoModal>("none");
  const [modalState, setModalState] = useState<ModalState>("empty");
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const go = (next: Section, statuses?: string[]) => {
    setSection(next);
    setMobileOpen(false);
    if (next === "Notas de Pedido") {
      setNotesStatuses(statuses ?? []);
    }
    window.history.pushState({}, "", next === "Inicio" ? "/" : `/${next.toLowerCase().replaceAll(" ", "-")}`);
  };
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const saveContact = (kind: ContactKind, contact: Contact) => {
    const isNew = !contact.id;
    if (kind === "cliente") {
      setClients((current) =>
        isNew
          ? [{ ...contact, id: nextContactId("cli", current) }, ...current]
          : current.map((item) => (item.id === contact.id ? contact : item)),
      );
    } else {
      setProviders((current) =>
        isNew
          ? [{ ...contact, id: nextContactId("prv", current) }, ...current]
          : current.map((item) => (item.id === contact.id ? contact : item)),
      );
    }
    setContactEditor(null);
    notify(kind === "cliente" ? "Cliente guardado" : "Proveedor guardado");
  };
  const deleteContact = (kind: ContactKind, id: string) => {
    if (kind === "cliente") {
      setClients((current) => current.filter((item) => item.id !== id));
    } else {
      setProviders((current) => current.filter((item) => item.id !== id));
    }
    setPendingDelete(null);
    setContactEditor(null);
    notify(`${kind === "cliente" ? "Cliente" : "Proveedor"} eliminado`);
  };
  const deleteOrder = (id: string) => {
    setOrders((current) => current.filter((item) => item.id !== id));
    setOpenOrderId(null);
    notify("Nota eliminada");
  };
  const closeOrder = (id: string) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: "Cerrada", closedAt: new Date().toISOString() }
          : item,
      ),
    );
    setOpenOrderId(null);
    notify("Pedido cerrado");
  };
  const updateOrderLines = (id: string, lines: Order["lines"], totalAmount: number) => {
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, lines, totalAmount } : item)),
    );
  };
  const createOrder = (draft: {
    client: string;
    lines: Order["lines"];
    totalAmount: number;
    status: Order["status"];
  }) => {
    const now = new Date().toISOString();
    setOrders((current) => [
      {
        id: nextOrderId(current),
        client: draft.client,
        provider: draft.lines[0]?.provider ?? "",
        createdAt: now,
        closedAt: draft.status === "Cerrada" ? now : null,
        status: draft.status,
        totalAmount: draft.totalAmount,
        lines: draft.lines,
      },
      ...current,
    ]);
  };

  const pendingOrders = useMemo(
    () => orders.filter((item) => item.status === "Pendiente"),
    [orders],
  );
  const filteredOrders = useMemo(
    () =>
      orders.filter((item) =>
        `${item.id} ${item.client} ${item.provider}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, query],
  );
  const retry = () => {
    setViewState("loading");
    window.setTimeout(() => setViewState("data"), 700);
  };
  const setDemoWindow = (next: DemoModal) => {
    setDemoModal(next);
    setModal(null);
    setImportOpen(false);
    setExportOpen(false);
    setContactEditor(null);
    setOpenOrderId(null);
  };
  const openOrder = orders.find((item) => item.id === openOrderId);

  return (
    <div className="cauce-app">
      <header className="site-header">
        <div className="header-inner">
          <button className="logo-button" onClick={() => go("Inicio")} aria-label="Ir a Inicio">
            <img src="/logo-cauce.png" alt="CAUCE" />
          </button>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map(([label]) => (
              <button
                key={label}
                className={section === label ? "active" : ""}
                onClick={() => go(label as Section)}
              >
                {label}
              </button>
            ))}
          </nav>
          <button className="menu-button" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
        </div>
        {mobileOpen && (
          <>
            <button
              type="button"
              className="mobile-menu-backdrop"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <div className="mobile-menu-panel">
              <div className="mobile-menu-top">
                <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
                  <X />
                </button>
              </div>
              {navItems.map(([label]) => (
                <button
                  key={label}
                  className={section === label ? "active" : ""}
                  onClick={() => go(label as Section)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      <main className="content-wrap">
        {section === "Inicio" && (
          <HomeView
            orders={orders}
            pendingOrders={pendingOrders}
            viewState={viewState}
            onRetry={retry}
            onNew={() => setModal("Nueva nota de pedido")}
            onSeeAll={() => go("Notas de Pedido", ["Pendientes"])}
            onOpen={(id) => setOpenOrderId(id)}
            onDelete={deleteOrder}
            onShare={() => notify("PDF listo para compartir")}
          />
        )}
        {section === "Notas de Pedido" && (
          <OrdersView
            query={query}
            setQuery={setQuery}
            rows={filteredOrders}
            orders={orders}
            initialStatuses={notesStatuses}
            viewState={viewState}
            onRetry={retry}
            onNew={() => setModal("Nueva nota de pedido")}
            onOpen={(id) => setOpenOrderId(id)}
            onDelete={deleteOrder}
            onShare={() => notify("PDF listo para compartir")}
          />
        )}
        {(section === "Clientes" || section === "Proveedores") && (
          <PeopleView
            kind={section}
            query={query}
            setQuery={setQuery}
            contacts={section === "Clientes" ? clients : providers}
            viewState={viewState}
            onRetry={retry}
            onNew={() =>
              setContactEditor({
                kind: section === "Clientes" ? "cliente" : "proveedor",
                contact: null,
              })
            }
            onOpen={(contact) =>
              setContactEditor({
                kind: section === "Clientes" ? "cliente" : "proveedor",
                contact,
              })
            }
            onDelete={(contact) =>
              setPendingDelete({
                kind: section === "Clientes" ? "cliente" : "proveedor",
                contact,
              })
            }
            onAction={notify}
          />
        )}
        {section === "Productos" && (
          <ProductsView
            query={query}
            setQuery={setQuery}
            onAction={notify}
            viewState={viewState}
            onRetry={retry}
            onImport={() => setImportOpen(true)}
            onExport={() => setExportOpen(true)}
          />
        )}
      </main>
      {openOrder && (
        <OrderDetailModal
          order={openOrder}
          onClose={() => {
            if (openOrder.status === "Pendiente") {
              notify("La nota de pedido se guardó como pendiente");
            }
            setOpenOrderId(null);
          }}
          onDelete={() => deleteOrder(openOrder.id)}
          onCloseOrder={() => closeOrder(openOrder.id)}
          onChangeLines={(lines, totalAmount) => updateOrderLines(openOrder.id, lines, totalAmount)}
        />
      )}
      {modal === "Nueva nota de pedido" || demoModal === "order" ? (
        <NewOrderModal
          clients={clients}
          demoState={demoModal === "order" ? modalState : undefined}
          onDismiss={() => {
            setModal(null);
            if (demoModal === "order") setDemoModal("none");
          }}
          onNotify={notify}
          onCreate={(draft) => {
            if (demoModal === "order") return;
            createOrder(draft);
            setModal(null);
            notify(
              draft.status === "Cerrada"
                ? "Nota de pedido cerrada"
                : "La nota de pedido se guardó como pendiente",
            );
          }}
        />
      ) : null}
      {contactEditor || demoModal === "client" || demoModal === "provider" ? (
        <ContactModal
          kind={
            demoModal === "provider"
              ? "proveedor"
              : demoModal === "client"
                ? "cliente"
                : contactEditor!.kind
          }
          contact={demoModal === "client" || demoModal === "provider" ? null : contactEditor?.contact ?? null}
          demoState={
            demoModal === "client" || demoModal === "provider" ? modalState : undefined
          }
          onClose={() => {
            setContactEditor(null);
            if (demoModal === "client" || demoModal === "provider") setDemoModal("none");
          }}
          onSave={(contact) => {
            const kind =
              demoModal === "provider"
                ? "proveedor"
                : demoModal === "client"
                  ? "cliente"
                  : contactEditor!.kind;
            saveContact(kind, contact);
            if (demoModal === "client" || demoModal === "provider") setDemoModal("none");
          }}
          onDelete={
            contactEditor?.contact && demoModal === "none"
              ? () => setPendingDelete({ kind: contactEditor.kind, contact: contactEditor.contact! })
              : undefined
          }
        />
      ) : null}
      {pendingDelete ? (
        <ConfirmDialog
          title={`¿Eliminar ${pendingDelete.kind}?`}
          message={`Se va a eliminar ${pendingDelete.contact.businessName}. Las notas de pedido ya cargadas no se modifican.`}
          confirmLabel="Eliminar"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteContact(pendingDelete.kind, pendingDelete.contact.id)}
        />
      ) : null}
      {importOpen || demoModal === "import" ? (
        <ImportListModal
          providers={providers}
          demoState={demoModal === "import" ? modalState : undefined}
          onClose={() => {
            setImportOpen(false);
            if (demoModal === "import") setDemoModal("none");
          }}
          onNotify={notify}
        />
      ) : null}
      {exportOpen || demoModal === "export" ? (
        <ExportCatalogModal
          demoState={demoModal === "export" ? modalState : undefined}
          onClose={() => {
            setExportOpen(false);
            if (demoModal === "export") setDemoModal("none");
          }}
          onNotify={notify}
        />
      ) : null}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <DemoStateBar
        viewState={viewState}
        onViewState={setViewState}
        demoModal={demoModal}
        onDemoModal={setDemoWindow}
        modalState={modalState}
        onModalState={setModalState}
      />
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`page-intro${description ? " has-subtitle" : ""}`}>
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p className="page-subtitle">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function DemoStateBar({
  viewState,
  onViewState,
  demoModal,
  onDemoModal,
  modalState,
  onModalState,
}: {
  viewState: ViewState;
  onViewState: (next: ViewState) => void;
  demoModal: DemoModal;
  onDemoModal: (next: DemoModal) => void;
  modalState: ModalState;
  onModalState: (next: ModalState) => void;
}) {
  return (
    <div className="demo-bar" role="region" aria-label="Selector de prototipo">
      <span className="demo-bar-label">Prototipo</span>
      <div className="demo-bar-row">
        <span className="demo-bar-caption">Estado de pantalla</span>
        <div className="demo-bar-pills">
          {VIEW_STATES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={viewState === item.id ? "on" : ""}
              onClick={() => onViewState(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="demo-bar-row">
        <span className="demo-bar-caption">Ventana</span>
        <div className="demo-bar-pills">
          {DEMO_WINDOWS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={demoModal === item.id ? "on" : ""}
              onClick={() => onDemoModal(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="demo-bar-row">
        <span className="demo-bar-caption">Estado de ventana</span>
        <div className="demo-bar-pills">
          {MODAL_STATES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={modalState === item.id ? "on" : ""}
              onClick={() => onModalState(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  copy,
  action,
}: {
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="status-panel">
      <p className="status-title">{title}</p>
      {copy ? <p className="status-copy">{copy}</p> : null}
      {action}
    </div>
  );
}

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={className ? `skeleton ${className}` : "skeleton"} style={style} aria-hidden="true" />;
}

function HomeView({
  orders,
  pendingOrders,
  viewState,
  onRetry,
  onNew,
  onSeeAll,
  onOpen,
  onDelete,
  onShare,
}: {
  orders: Order[];
  pendingOrders: Order[];
  viewState: ViewState;
  onRetry: () => void;
  onNew: () => void;
  onSeeAll: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: () => void;
}) {
  const now = new Date();
  const month = monthName(now);
  const source = viewState === "empty" ? [] : orders;
  const visiblePending = viewState === "empty" ? [] : pendingOrders;
  const monthTotal = currentMonthSales(source, now);
  const monthRange = `Del 1 al ${now.getDate()} de ${month}`;
  const podium = topSoldProducts(source, now);
  const podiumRange = last3MonthsCaption(now);
  const months = last12MonthsSales(source, now);

  return (
    <>
      <PageIntro
        title="Estado de Trabajo"
        action={
          <PrimaryButton onClick={onNew}>
            <Plus /> Nueva nota de pedido
          </PrimaryButton>
        }
      />
      {viewState === "loading" ? (
        <>
          <section className="surface">
            <div className="section-heading inline">
              <Skeleton className="sk-title" />
              <Skeleton className="sk-link" />
            </div>
            <div className="order-list">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="skeleton-order compact" key={index}>
                  <div>
                    <Skeleton className="sk-line w-40" />
                    <Skeleton className="sk-line w-56" />
                    <Skeleton className="sk-line w-72" />
                  </div>
                  <Skeleton className="sk-amount" />
                </div>
              ))}
            </div>
          </section>
          <div className="insights-grid">
            <section className="insights-panel sales-month">
              <Skeleton className="sk-eyebrow" />
              <Skeleton className="sk-kpi" />
              <Skeleton className="sk-line w-48" />
            </section>
            <section className="insights-panel top-products">
              <Skeleton className="sk-eyebrow" />
              <div className="podium">
                <Skeleton className="sk-podium" style={{ height: 72 }} />
                <Skeleton className="sk-podium" style={{ height: 96 }} />
                <Skeleton className="sk-podium" style={{ height: 56 }} />
              </div>
            </section>
            <section className="insights-panel chart-panel">
              <Skeleton className="sk-eyebrow" />
              <div className="sk-legend">
                <Skeleton className="sk-pill" />
                <Skeleton className="sk-pill" />
                <Skeleton className="sk-pill" />
              </div>
              <div className="sk-chart">
                {[40, 70, 55, 90, 35, 60, 48, 80, 52, 75, 88, 96].map((height, index) => (
                  <Skeleton className="sk-bar" key={index} style={{ height }} />
                ))}
              </div>
            </section>
          </div>
        </>
      ) : viewState === "error" ? (
        <section className="surface">
          <StatusPanel
            title="No pudimos cargar la información"
            copy="Ocurrió un problema al obtener el estado de trabajo. Podés intentar de nuevo."
            action={<PrimaryButton onClick={onRetry}>Reintentar</PrimaryButton>}
          />
        </section>
      ) : (
        <>
          <section className="surface">
            <div className="section-heading inline">
              <h2>Notas pendientes ({visiblePending.length})</h2>
              {visiblePending.length > 0 ? (
                <button className="link-button" onClick={onSeeAll}>
                  Ver todas las pendientes <ChevronRight />
                </button>
              ) : null}
            </div>
            {visiblePending.length === 0 ? (
              <StatusPanel title="Todavía no hay notas de pedido" />
            ) : (
              <OrderRows
                compact
                rows={visiblePending}
                onOpen={onOpen}
                onDelete={onDelete}
                onShare={onShare}
              />
            )}
          </section>
          {viewState === "empty" ? (
            <section className="surface metrics-cue">
              <p className="status-title">Tus métricas se generarán automáticamente</p>
              <p className="status-copy">
                A medida que cierres notas de pedido, vas a poder consultar tus ventas del mes, los
                productos más vendidos y la evolución de tus ventas.
              </p>
              <PrimaryButton onClick={onNew}>Crear primera nota de pedido</PrimaryButton>
            </section>
          ) : null}
          <div className="insights-grid">
            <section className={`insights-panel sales-month${viewState === "empty" ? " is-empty" : ""}`}>
              <span className="eyebrow">Ventas de {month}</span>
              <strong>{formatARS(monthTotal)}</strong>
              <span className="muted">
                {viewState === "empty" ? "Todavía no hay ventas cerradas este mes" : monthRange}
              </span>
            </section>
            <section className={`insights-panel top-products${viewState === "empty" ? " is-empty" : ""}`}>
              <span className="eyebrow">Productos más vendidos</span>
              <Podium items={podium} emptyLabel="Disponible cuando cierres tus primeras notas de pedido" />
              {viewState === "empty" ? null : <span className="podium-note">{podiumRange}</span>}
            </section>
            <section className={`insights-panel chart-panel${viewState === "empty" ? " is-empty" : ""}`}>
              <span className="eyebrow">Ventas de los últimos 12 meses</span>
              <SalesChart months={months} />
            </section>
          </div>
        </>
      )}
    </>
  );
}

function MultiFilter({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);
  };

  const buttonLabel =
    selected.length === 0 ? label : selected.length === 1 ? selected[0] : label;

  return (
    <div className="filter-wrap" ref={box}>
      <button
        type="button"
        className={`filter-button${selected.length > 0 ? " active-filter" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {icon}
        <span className="filter-label">{buttonLabel}</span>
        {selected.length > 1 ? <span className="filter-count">{selected.length}</span> : null}
        <ChevronDown className="filter-chevron" />
      </button>
      {open && (
        <div className="provider-menu check-menu" role="listbox" aria-multiselectable="true">
          <p className="filter-menu-title">{label}</p>
          {selected.length > 0 ? (
            <button type="button" className="filter-clear" onClick={() => onChange([])}>
              Ver todas
            </button>
          ) : null}
          {options.length === 0 ? (
            <p className="combo-empty">No hay opciones</p>
          ) : (
            options.map((option) => {
              const checked = selected.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={checked ? "selected" : ""}
                  aria-selected={checked}
                  onClick={() => toggle(option)}
                >
                  <span className={`check-box${checked ? " on" : ""}`} aria-hidden="true" />
                  {option}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function orderProviders(order: Order) {
  return [order.provider, ...order.lines.map((line) => line.provider)].filter(Boolean);
}

function OrdersView({
  query,
  setQuery,
  rows,
  orders,
  initialStatuses = [],
  viewState,
  onRetry,
  onNew,
  onOpen,
  onDelete,
  onShare,
}: {
  query: string;
  setQuery: (value: string) => void;
  rows: Order[];
  orders: Order[];
  initialStatuses?: string[];
  viewState: ViewState;
  onRetry: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: () => void;
}) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const sourceOrders = viewState === "empty" ? [] : orders;
  const sourceRows = viewState === "empty" ? [] : rows;
  const clientOptions = useMemo(
    () =>
      [...new Set(sourceOrders.map((item) => item.client))].sort((left, right) =>
        left.localeCompare(right, "es", { sensitivity: "base" }),
      ),
    [sourceOrders],
  );
  const providerOptions = useMemo(
    () =>
      [...new Set(sourceOrders.flatMap((item) => orderProviders(item)))].sort((left, right) =>
        left.localeCompare(right, "es", { sensitivity: "base" }),
      ),
    [sourceOrders],
  );
  const filteredRows = useMemo(
    () =>
      sourceRows.filter((item) => {
        const matchesStatus =
          selectedStatuses.length === 0 ||
          selectedStatuses.some((status) =>
            status === "Pendientes" ? item.status === "Pendiente" : item.status === "Cerrada",
          );
        const matchesClient = selectedClients.length === 0 || selectedClients.includes(item.client);
        const matchesProvider =
          selectedProviders.length === 0 ||
          orderProviders(item).some((provider) => selectedProviders.includes(provider));
        return matchesStatus && matchesClient && matchesProvider;
      }),
    [sourceRows, selectedStatuses, selectedClients, selectedProviders],
  );
  const clearFilters = () => {
    setQuery("");
    setSelectedStatuses([]);
    setSelectedClients([]);
    setSelectedProviders([]);
  };

  useEffect(() => {
    setPage(1);
  }, [query, pageSize, selectedStatuses, selectedClients, selectedProviders]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageIntro
        title="Notas de Pedido"
        action={
          viewState === "empty" ? undefined : (
            <PrimaryButton onClick={onNew}>
              <Plus /> Nueva nota de pedido
            </PrimaryButton>
          )
        }
      />
      {viewState === "loading" ? (
        <>
          <div className="toolbar orders-toolbar">
            <Skeleton className="sk-search" />
            <div className="toolbar-filters">
              <Skeleton className="sk-filter" />
              <Skeleton className="sk-filter" />
              <Skeleton className="sk-filter" />
            </div>
          </div>
          <section className="surface">
            <div className="order-list">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="skeleton-order" key={index}>
                  <div>
                    <Skeleton className="sk-line w-32" />
                    <Skeleton className="sk-line w-56" />
                    <Skeleton className="sk-line w-72" />
                  </div>
                  <Skeleton className="sk-amount" />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : viewState === "error" ? (
        <section className="surface">
          <StatusPanel
            title="No pudimos cargar las notas de pedido"
            copy="Ocurrió un problema al obtener el listado. Podés intentar de nuevo."
            action={<PrimaryButton onClick={onRetry}>Reintentar</PrimaryButton>}
          />
        </section>
      ) : sourceOrders.length === 0 ? (
        <section className="surface">
          <StatusPanel
            title="Todavía no cargaste notas de pedido"
            copy="Cuando armes la primera, va a aparecer acá."
            action={
              <PrimaryButton onClick={onNew}>
                <Plus /> Nueva nota de pedido
              </PrimaryButton>
            }
          />
        </section>
      ) : (
        <>
      <div className="toolbar orders-toolbar">
        <div className="search-field">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar notas de pedido"
          />
        </div>
        <div className="toolbar-filters">
          <MultiFilter
            label="Estado"
            icon={<ListFilter />}
            options={["Pendientes", "Cerradas"]}
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
          />
          <MultiFilter
            label="Clientes"
            icon={<Users />}
            options={clientOptions}
            selected={selectedClients}
            onChange={setSelectedClients}
          />
          <MultiFilter
            label="Proveedores"
            icon={<Package />}
            options={providerOptions}
            selected={selectedProviders}
            onChange={setSelectedProviders}
          />
        </div>
      </div>
      <section className="surface">
        {visibleRows.length === 0 ? (
          <StatusPanel
            title="No encontramos notas con estos filtros"
            copy="Probá cambiar la búsqueda o los filtros de estado, cliente o proveedor."
            action={<PrimaryButton onClick={clearFilters}>Limpiar filtros</PrimaryButton>}
          />
        ) : (
          <OrderRows rows={visibleRows} onOpen={onOpen} onDelete={onDelete} onShare={onShare} />
        )}
            {visibleRows.length > 0 ? (
              <div className="list-footer">
          <label className="page-size">
            Mostrar
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              aria-label="Notas por página"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            notas
          </label>
          <div className="pagination">
            <button
              className="page-arrow"
              aria-label="Página anterior"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft />
            </button>
            {[currentPage - 2, currentPage - 1]
              .filter((number) => number >= 1)
              .map((number) => (
                <button key={number} className="page-num" onClick={() => setPage(number)}>
                  {number}
                </button>
              ))}
            <button className="page-num current" aria-current="page">
              {currentPage}
            </button>
            {[currentPage + 1, currentPage + 2]
              .filter((number) => number <= totalPages)
              .map((number) => (
                <button key={number} className="page-num" onClick={() => setPage(number)}>
                  {number}
                </button>
              ))}
            <button
              className="page-arrow"
              aria-label="Página siguiente"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight />
            </button>
            <span className="page-total">
              {totalPages} {totalPages === 1 ? "página" : "páginas"}
            </span>
          </div>
              </div>
            ) : null}
      </section>
        </>
      )}
    </>
  );
}

function OrderRows({
  compact = false,
  rows = [],
  onOpen,
  onDelete,
  onShare,
}: {
  compact?: boolean;
  rows?: Order[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: () => void;
}) {
  return (
    <div className="order-list">
      {rows.map((item) => (
        <div
          className={`order-row ${compact ? "compact" : "detailed"}`}
          key={item.id}
          onClick={() => onOpen(item.id)}
        >
          {compact ? (
            <>
              <div className="order-main">
                <strong>Pedido #{item.id.replace(/^NP-/, "")}</strong>
                <b>{item.client}</b>
                <span>
                  {item.provider} · {formatOrderDate(item.createdAt)} · {productCount(item)} productos
                </span>
              </div>
              <strong className="order-amount">{formatARS(item.totalAmount)}</strong>
              <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                <button className="danger" aria-label="Eliminar" onClick={() => onDelete(item.id)}>
                  <Trash2 />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="order-main stacked">
                <div className="order-heading">
                  <strong>{item.id}</strong>
                  <span className={`badge ${item.status === "Cerrada" ? "blue" : "amber"}`}>
                    {item.status}
                  </span>
                </div>
                <b>{item.client}</b>
                <span>
                  {item.provider} · {formatOrderDate(item.createdAt)} · {productCount(item)} productos
                </span>
              </div>
              <div className="order-side">
                <strong className="order-amount">{formatARS(item.totalAmount)}</strong>
                <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                  <IconButton
                    className="danger"
                    label="Borrar"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 />
                  </IconButton>
                  <IconButton label="Compartir" onClick={onShare}>
                    <Share2 />
                  </IconButton>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function PeopleView({
  kind,
  query,
  setQuery,
  contacts,
  viewState,
  onRetry,
  onNew,
  onOpen,
  onDelete,
  onAction,
}: {
  kind: "Clientes" | "Proveedores";
  query: string;
  setQuery: (value: string) => void;
  contacts: Contact[];
  viewState: ViewState;
  onRetry: () => void;
  onNew: () => void;
  onOpen: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onAction: (text: string) => void;
}) {
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setSortAsc(true);
  }, [kind]);

  const source = viewState === "empty" ? [] : contacts;
  const isClients = kind === "Clientes";
  const singular = isClients ? "cliente" : "proveedor";
  const newLabel = isClients ? "Nuevo cliente" : "Nuevo proveedor";
  const list = source
    .filter((item) => {
      const haystack = `${item.businessName} ${item.name} ${item.cuit} ${item.phone} ${item.email}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    })
    .slice()
    .sort((left, right) => {
      const compare = left.businessName.localeCompare(right.businessName, "es", { sensitivity: "base" });
      return sortAsc ? compare : -compare;
    });

  return (
    <>
      <PageIntro
        title={kind}
        action={
          viewState === "empty" ? undefined : (
            <PrimaryButton onClick={onNew}>
              <Plus /> {newLabel}
            </PrimaryButton>
          )
        }
      />
      {viewState === "loading" ? (
        <>
          <div className="toolbar">
            <Skeleton className="sk-search" />
            <Skeleton className="sk-sort" />
          </div>
          <section className="surface people-list">
            <div className="table-head">
              <Skeleton className="sk-line w-32" />
              <Skeleton className="sk-line w-40" />
              <Skeleton className="sk-line w-32" />
              <Skeleton className="sk-line w-24" />
            </div>
            {Array.from({ length: 6 }, (_, index) => (
              <div className="skeleton-person" key={index}>
                <Skeleton className="sk-line w-56" />
                <Skeleton className="sk-line w-40" />
                <Skeleton className="sk-line w-32" />
                <Skeleton className="sk-amount" />
              </div>
            ))}
          </section>
        </>
      ) : viewState === "error" ? (
        <section className="surface">
          <StatusPanel
            title={isClients ? "No pudimos cargar los clientes" : "No pudimos cargar los proveedores"}
            copy={`Ocurrió un problema al obtener el listado de ${kind.toLowerCase()}. Podés intentar de nuevo.`}
            action={<PrimaryButton onClick={onRetry}>Reintentar</PrimaryButton>}
          />
        </section>
      ) : source.length === 0 ? (
        <section className="surface">
          <StatusPanel
            title={isClients ? "Todavía no cargaste clientes" : "Todavía no cargaste proveedores"}
            copy={`Cuando agregues el primer ${singular}, va a aparecer en este listado.`}
            action={
              <PrimaryButton onClick={onNew}>
                <Plus /> {newLabel}
              </PrimaryButton>
            }
          />
        </section>
      ) : (
        <>
          <div className="toolbar">
            <div className="search-field">
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Buscar ${kind.toLowerCase()}`}
              />
            </div>
            <button className="secondary-button" onClick={() => setSortAsc((value) => !value)}>
              {sortAsc ? "Ordenar A–Z" : "Ordenar Z–A"}
            </button>
          </div>
          <section className="surface people-list">
            <div className="table-head">
              <span>Razón social</span>
              <span>Nombre y apellido</span>
              <span>Teléfono</span>
              <span>Acciones</span>
            </div>
            {list.length === 0 ? (
              <StatusPanel
                title={
                  isClients
                    ? "No encontramos clientes con esa búsqueda"
                    : "No encontramos proveedores con esa búsqueda"
                }
                copy="Probá con otro nombre, CUIT o dato de contacto."
                action={<PrimaryButton onClick={() => setQuery("")}>Limpiar búsqueda</PrimaryButton>}
              />
            ) : (
              list.map((item) => (
                <div className="person-row" key={item.id} onClick={() => onOpen(item)}>
                  <b>{item.businessName}</b>
                  <span className="person-name">{item.name}</span>
                  <span className="person-phone">{item.phone}</span>
                  <div className="row-actions" onClick={(event) => event.stopPropagation()}>
                    <IconButton label="Llamar" onClick={() => onAction("Llamando al contacto")}>
                      <Phone />
                    </IconButton>
                    <IconButton label="WhatsApp" onClick={() => onAction("WhatsApp abierto")}>
                      <WhatsAppIcon />
                    </IconButton>
                    <IconButton className="danger" label="Borrar" onClick={() => onDelete(item)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </>
  );
}

function ProductsView({
  query,
  setQuery,
  onAction,
  viewState,
  onRetry,
  onImport,
  onExport,
}: {
  query: string;
  setQuery: (value: string) => void;
  onAction: (text: string) => void;
  viewState: ViewState;
  onRetry: () => void;
  onImport: () => void;
  onExport: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [providerFilter, setProviderFilter] = useState("Todos");
  const [providerOpen, setProviderOpen] = useState(false);
  const catalog = viewState === "empty" ? [] : PRODUCT_CATALOG;
  const filterProviders = ["Todos", ...Array.from(new Set(catalog.map((item) => item.provider)))];

  const visible = catalog.filter((item) => {
    const haystack = `${item.name} ${item.code} ${item.provider}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesProvider = providerFilter === "Todos" || item.provider === providerFilter;
    return matchesQuery && matchesProvider;
  });
  const clearFilters = () => {
    setQuery("");
    setProviderFilter("Todos");
  };

  const renderImportButton = () => (
    <button type="button" className="sky-button" onClick={onImport}>
      <FileUp /> Importar lista
    </button>
  );

  const openImagePicker = (id: string) => {
    setUploadId(id);
    fileInputRef.current?.click();
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadId) return;
    const url = URL.createObjectURL(file);
    setImages((current) => {
      const previous = current[uploadId];
      if (previous) URL.revokeObjectURL(previous);
      return { ...current, [uploadId]: url };
    });
    onAction("Imagen cargada");
    event.target.value = "";
  };

  return (
    <>
      <PageIntro
        title="Productos"
        description="Buscá artículos y consultá precios rápidamente"
        action={
          viewState === "empty" ? undefined : (
            <div className="intro-actions">
              {renderImportButton()}
              <PrimaryButton onClick={onExport}>
                <FileDown /> Exportar catálogos
              </PrimaryButton>
            </div>
          )
        }
      />
      {viewState === "loading" ? (
        <>
          <div className="toolbar">
            <Skeleton className="sk-search" />
            <Skeleton className="sk-sort" />
          </div>
          <div className="product-cards">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skeleton-product" key={index}>
                <Skeleton className="sk-thumb" />
                <div>
                  <Skeleton className="sk-line w-56" />
                  <Skeleton className="sk-line w-40" />
                  <Skeleton className="sk-line w-24" />
                </div>
                <Skeleton className="sk-amount" />
              </div>
            ))}
          </div>
        </>
      ) : viewState === "error" ? (
        <section className="surface">
          <StatusPanel
            title="No pudimos cargar los productos"
            copy="Ocurrió un problema al obtener el catálogo. Podés intentar de nuevo."
            action={<PrimaryButton onClick={onRetry}>Reintentar</PrimaryButton>}
          />
        </section>
      ) : catalog.length === 0 ? (
        <section className="surface">
          <StatusPanel
            title="Todavía no hay productos cargados"
            copy="Importá una lista para empezar a consultar precios."
            action={renderImportButton()}
          />
        </section>
      ) : (
        <>
      <div className="toolbar">
        <div className="search-field">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar código o producto"
          />
        </div>
        <div className="filter-wrap">
          <button
            className="secondary-button"
            onClick={() => setProviderOpen((open) => !open)}
            aria-expanded={providerOpen}
          >
            <Package /> {providerFilter === "Todos" ? "Proveedores" : providerFilter} <ChevronDown />
          </button>
          {providerOpen && (
            <div className="provider-menu" role="listbox">
              {filterProviders.map((provider) => (
                <button
                  key={provider}
                  className={providerFilter === provider ? "selected" : ""}
                  onClick={() => {
                    setProviderFilter(provider);
                    setProviderOpen(false);
                  }}
                >
                  {provider}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImage}
      />
      <div className="product-cards">
        {visible.length === 0 ? (
          <section className="surface">
            <StatusPanel
              title="No encontramos productos con esos filtros"
              copy="Probá cambiar la búsqueda o el proveedor seleccionado."
              action={<PrimaryButton onClick={clearFilters}>Limpiar filtros</PrimaryButton>}
            />
          </section>
        ) : (
          visible.map((item) => {
          const photo = images[item.id];
          return (
          <article className="product-card" key={item.id}>
            <button
              type="button"
              className="product-thumb icon-tip"
              aria-label="Cargar imagen"
              data-tip="Cargar imagen"
              onClick={() => openImagePicker(item.id)}
            >
              {photo ? (
                <img src={photo} alt={`Foto de ${item.name}`} />
              ) : item.price === null ? (
                <Package />
              ) : (
                <ImageIcon />
              )}
            </button>
            <div className="product-card-body">
              <b>{item.name}</b>
              <span className="product-provider">{item.provider}</span>
              <div className="product-card-meta">
                <span>{item.code}</span>
              </div>
            </div>
            <div className="product-price">
              {item.price === null ? (
                <span className="badge amber">A cotizar</span>
              ) : (
                <>
                  <strong>{formatARS(item.price)}</strong>
                  <span>SIN IVA</span>
                </>
              )}
            </div>
            <IconButton className="edit" label="Editar" onClick={() => onAction("Edición habilitada")}>
              <Pencil />
            </IconButton>
          </article>
          );
        })
        )}
      </div>
        </>
      )}
    </>
  );
}

function catalogRows(selected: string[]) {
  return PRODUCT_CATALOG.filter((item) => selected.includes(item.provider));
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function catalogCsv(rows: typeof PRODUCT_CATALOG) {
  const header = "Código;Producto;Proveedor;Precio";
  const lines = rows.map((item) =>
    [item.code, item.name, item.provider, item.price === null ? "A cotizar" : String(item.price)].join(";"),
  );
  return `\uFEFF${[header, ...lines].join("\n")}`;
}

function catalogHtml(rows: typeof PRODUCT_CATALOG) {
  const body = rows
    .map(
      (item) =>
        `<tr><td>${item.code}</td><td>${item.name}</td><td>${item.provider}</td><td>${item.price === null ? "A cotizar" : formatARS(item.price)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Catálogo CAUCE</title>
<style>body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#1E293B}h1{font-size:22px;margin:0 0 6px}p{color:#64748B;margin:0 0 18px;font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #E2E8F0;padding:8px 10px;text-align:left;font-size:13px}th{background:#EFF6FF;color:#1E40AF}</style>
</head><body><h1>Catálogo de productos</h1><p>CAUCE</p><table><thead><tr><th>Código</th><th>Producto</th><th>Proveedor</th><th>Precio</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
}

async function shareCatalog(file: File, onNotify: (text: string) => void) {
  const payload = { files: [file], title: "Catálogo CAUCE", text: "Catálogo de productos CAUCE" };
  if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(payload))) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") return;
    }
  }
  onNotify("Catálogo listo para compartir");
}

function WizardModal({
  title,
  steps,
  step,
  onClose,
  onBack,
  onNext,
  onSelectStep,
  nextDisabled = false,
  nextLabel = "Siguiente",
  busy = false,
  children,
}: {
  title: string;
  steps: string[];
  step: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSelectStep?: (next: number) => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-layer" onMouseDown={busy ? undefined : onClose}>
      <div className="modal-card contact-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-title plain">
          <div>
            <h2>{title}</h2>
            <p className="export-step-label">
              Paso {step} de {steps.length}: {steps[step - 1]}
            </p>
          </div>
          <button type="button" onClick={busy ? undefined : onClose} aria-label="Cerrar" disabled={busy}>
            <X />
          </button>
        </div>
        <div className="wizard-tabs" role="tablist" aria-label="Pasos">
          {steps.map((label, index) => {
            const number = index + 1;
            const current = step === number;
            const done = step > number;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={current}
                key={label}
                className={current ? "current" : done ? "done" : ""}
                disabled={!done || busy}
                onClick={() => {
                  if (done) onSelectStep ? onSelectStep(number) : onBack();
                }}
              >
                <span className="wizard-step-num">{number}</span>
                <span className="wizard-tab-text">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="wizard-body">{children}</div>
        <div className="modal-actions wizard-nav">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <div className="modal-actions-end">
            <button type="button" className="secondary-button" onClick={onBack} disabled={step <= 1 || busy}>
              Anterior
            </button>
            <PrimaryButton onClick={onNext} disabled={nextDisabled || busy}>
              {nextLabel}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportCatalogModal({
  onClose,
  onNotify,
  demoState,
}: {
  onClose: () => void;
  onNotify: (text: string) => void;
  demoState?: ModalState;
}) {
  const steps = ["Seleccionar proveedor", "Elegir formato", "Descargar y compartir"];
  const providerOptions = [...new Set(PRODUCT_CATALOG.map((item) => item.provider))];
  const [step, setStep] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [format, setFormat] = useState<"excel" | "pdf" | null>(null);
  const [phase, setPhase] = useState<"form" | "loading" | "error" | "success">("form");
  const rows = catalogRows(selectedProviders);

  useEffect(() => {
    if (!demoState) return;
    if (demoState === "empty") {
      setSelectedProviders([]);
      setFormat(null);
      setStep(1);
      setPhase("form");
    } else if (demoState === "data") {
      setSelectedProviders(providerOptions.slice(0, 2));
      setFormat("excel");
      setStep(2);
      setPhase("form");
    } else if (demoState === "loading") {
      setSelectedProviders(providerOptions.slice(0, 2));
      setFormat("excel");
      setStep(3);
      setPhase("loading");
    } else {
      setSelectedProviders(providerOptions.slice(0, 2));
      setFormat("excel");
      setStep(3);
      setPhase("error");
    }
  }, [demoState]);

  const toggleProvider = (name: string) => {
    setSelectedProviders((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  const buildFile = () => {
    if (format === "excel") {
      return new File([catalogCsv(rows)], "catalogo-cauce.csv", { type: "text/csv;charset=utf-8" });
    }
    return new File([catalogHtml(rows)], "catalogo-cauce.html", { type: "text/html;charset=utf-8" });
  };

  const download = () => {
    if (format === "excel") {
      downloadBlob("catalogo-cauce.csv", new Blob([catalogCsv(rows)], { type: "text/csv;charset=utf-8" }));
      onNotify("Catálogo Excel descargado");
      return;
    }
    const popup = window.open("", "_blank");
    if (popup) {
      popup.document.write(catalogHtml(rows));
      popup.document.close();
      popup.focus();
      popup.print();
    } else {
      downloadBlob("catalogo-cauce.html", new Blob([catalogHtml(rows)], { type: "text/html;charset=utf-8" }));
    }
    onNotify("Catálogo PDF listo para guardar");
  };

  const generate = () => {
    if (rows.length === 0) {
      setPhase("error");
      setStep(3);
      return;
    }
    setPhase("loading");
    setStep(3);
    window.setTimeout(() => setPhase(demoState === "error" ? "error" : "success"), 900);
  };

  const canNext =
    phase === "success" ||
    phase === "error" ||
    (step === 1 && selectedProviders.length > 0) ||
    (step === 2 && format !== null);

  const nextLabel =
    phase === "loading"
      ? "Generando catálogo…"
      : phase === "error"
        ? "Reintentar"
        : phase === "success"
          ? "Cerrar"
          : "Siguiente";

  return (
    <WizardModal
      title="Exportar catálogos"
      steps={steps}
      step={step}
      onClose={onClose}
      onBack={() => {
        setPhase("form");
        setStep((current) => Math.max(1, current - 1));
      }}
      onSelectStep={(next) => {
        setPhase("form");
        setStep(next);
      }}
      onNext={() => {
        if (phase === "error") {
          generate();
          return;
        }
        if (phase === "success") {
          onClose();
          return;
        }
        if (step === 1 && canNext) setStep(2);
        else if (step === 2 && canNext) generate();
      }}
      nextDisabled={!canNext || phase === "loading"}
      nextLabel={nextLabel}
      busy={phase === "loading"}
    >
      {phase === "loading" ? (
        <StatusPanel title="Generando catálogo…" copy="Esto puede tardar unos segundos." />
      ) : phase === "error" ? (
        <StatusPanel
          title={rows.length === 0 ? "No hay productos para exportar" : "No pudimos generar el catálogo"}
          copy={
            rows.length === 0
              ? "Seleccioná proveedores que tengan productos cargados e intentá de nuevo."
              : "Ocurrió un problema al generar el archivo. Podés reintentar sin perder la selección."
          }
        />
      ) : phase === "success" ? (
        <div className="export-finish">
          <p className="modal-alert success">Catálogo generado</p>
          <p className="confirm-copy">
            {rows.length} producto{rows.length === 1 ? "" : "s"} · {format === "excel" ? "Excel" : "PDF"}
          </p>
          <div className="format-choice">
            <button type="button" className="format-card" onClick={download}>
              <FileDown />
              <b>Descargar</b>
            </button>
            <button
              type="button"
              className="format-card"
              onClick={() => {
                void shareCatalog(buildFile(), onNotify);
              }}
            >
              <Share2 />
              <b>Compartir</b>
            </button>
            <button type="button" className="format-card" onClick={onClose}>
              <b>Cerrar</b>
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="check-menu export-providers">
          <button type="button" className="filter-clear" onClick={() => setSelectedProviders(providerOptions)}>
            Todos
          </button>
          {providerOptions.map((option) => {
            const checked = selectedProviders.includes(option);
            return (
              <button
                type="button"
                key={option}
                className={checked ? "selected" : ""}
                aria-selected={checked}
                onClick={() => toggleProvider(option)}
              >
                <span className={`check-box${checked ? " on" : ""}`} aria-hidden="true" />
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="format-choice">
          <button
            type="button"
            className={`format-card${format === "excel" ? " selected" : ""}`}
            onClick={() => setFormat("excel")}
          >
            <b>Excel</b>
            <span>Archivo .csv para abrir en Excel</span>
          </button>
          <button
            type="button"
            className={`format-card${format === "pdf" ? " selected" : ""}`}
            onClick={() => setFormat("pdf")}
          >
            <b>PDF</b>
            <span>Documento listo para imprimir o guardar</span>
          </button>
        </div>
      )}
    </WizardModal>
  );
}

function ImportListModal({
  providers,
  onClose,
  onNotify,
  demoState,
}: {
  providers: Contact[];
  onClose: () => void;
  onNotify: (text: string) => void;
  demoState?: ModalState;
}) {
  const steps = ["Seleccionar proveedor", "Importar Excel"];
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"form" | "reading" | "updating" | "error" | "success">("form");
  const [errorKind, setErrorKind] = useState<"providers" | "file" | "columns" | "import">("import");
  const inputRef = useRef<HTMLInputElement>(null);
  const firstProviderName = providers[0]?.businessName ?? "Cementos del Sur";
  const hasProviders = providers.length > 0;

  useEffect(() => {
    if (!demoState) return;
    if (demoState === "empty") {
      setSelectedProvider("");
      setFile(null);
      setFileName("");
      setStep(1);
      setPhase("form");
    } else if (demoState === "data") {
      setSelectedProvider(firstProviderName);
      setFileName("lista-cementos.xlsx");
      setStep(2);
      setPhase("form");
    } else if (demoState === "loading") {
      setSelectedProvider(firstProviderName);
      setFileName("lista-cementos.xlsx");
      setStep(2);
      setPhase("reading");
    } else {
      setSelectedProvider(firstProviderName);
      setFileName("lista-cementos.xlsx");
      setStep(2);
      setPhase("error");
      setErrorKind(hasProviders ? "import" : "providers");
    }
  }, [demoState, firstProviderName, hasProviders]);

  useEffect(() => {
    if (demoState !== "loading") return;
    const timer = window.setTimeout(() => setPhase("updating"), 1100);
    return () => window.clearTimeout(timer);
  }, [demoState]);

  const takeFile = (next: File | null) => {
    if (!next) return;
    if (!/\.(xlsx|xls|csv)$/i.test(next.name)) {
      setErrorKind("file");
      setPhase("error");
      return;
    }
    setFile(next);
    setFileName(next.name);
    setPhase("form");
  };

  const runImport = () => {
    if (!hasProviders) {
      setErrorKind("providers");
      setPhase("error");
      return;
    }
    if (!file && !fileName) {
      setErrorKind("file");
      setPhase("error");
      return;
    }
    setPhase("reading");
    window.setTimeout(() => {
      setPhase("updating");
      window.setTimeout(() => {
        setPhase(demoState === "error" ? "error" : "success");
        if (demoState === "error") setErrorKind("import");
      }, 700);
    }, 700);
  };

  const canNext =
    phase === "success" ||
    phase === "error" ||
    (step === 1 && selectedProvider.length > 0) ||
    (step === 2 && (file !== null || fileName.length > 0));

  const nextLabel =
    phase === "reading"
      ? "Leyendo archivo…"
      : phase === "updating"
        ? "Actualizando productos…"
        : phase === "error"
          ? "Reintentar"
          : phase === "success"
            ? "Cerrar"
            : step === 2
              ? "Importar"
              : "Siguiente";

  const busy = phase === "reading" || phase === "updating";

  const errorCopy = {
    providers: "Todavía no hay proveedores. Creá un proveedor antes de importar una lista.",
    file: "El archivo no es válido. Usá un Excel (.xlsx) o CSV.",
    columns: "No reconocimos las columnas. Corregí el archivo o elegí otra hoja.",
    import: "No pudimos importar la lista. Podés reintentar sin perder el proveedor seleccionado.",
  }[errorKind];

  return (
    <WizardModal
      title="Importar lista"
      steps={steps}
      step={step}
      onClose={onClose}
      onBack={() => {
        setPhase("form");
        setStep((current) => Math.max(1, current - 1));
      }}
      onSelectStep={(next) => {
        setPhase("form");
        setStep(next);
      }}
      onNext={() => {
        if (phase === "error") {
          if (errorKind === "providers") return;
          if (errorKind === "file" || errorKind === "columns") {
            setPhase("form");
            setStep(2);
            return;
          }
          runImport();
          return;
        }
        if (phase === "success") {
          onNotify("Lista importada");
          onClose();
          return;
        }
        if (step === 1 && canNext) {
          setStep(2);
          return;
        }
        if (step === 2) runImport();
      }}
      nextDisabled={!canNext || busy || (phase === "error" && errorKind === "providers")}
      nextLabel={nextLabel}
      busy={busy}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      {busy ? (
        <StatusPanel
          title={phase === "reading" ? "Leyendo archivo…" : "Actualizando productos…"}
          copy="No cierres esta ventana hasta que termine la importación."
        />
      ) : phase === "error" ? (
        <div className="import-step">
          <StatusPanel title="No pudimos completar la importación" copy={errorCopy} />
          {errorKind === "file" || errorKind === "columns" ? (
            <button
              type="button"
              className="dropzone"
              onClick={() => inputRef.current?.click()}
            >
              <FileUp />
              <b>Elegí otro archivo</b>
              <span>Excel (.xlsx) o CSV</span>
            </button>
          ) : null}
        </div>
      ) : phase === "success" ? (
        <div className="export-finish">
          <p className="modal-alert success">Lista importada</p>
          <p className="confirm-copy">12 productos actualizados · 3 agregados · 1 no se pudo procesar</p>
        </div>
      ) : step === 1 ? (
        <div className="check-menu export-providers">
          {!hasProviders ? (
            <p className="combo-empty">Todavía no hay proveedores. Creá un proveedor para importar una lista.</p>
          ) : (
            providers.map((option) => {
              const checked = selectedProvider === option.businessName;
              return (
                <button
                  type="button"
                  key={option.id || option.businessName}
                  className={checked ? "selected" : ""}
                  aria-selected={checked}
                  onClick={() => setSelectedProvider(option.businessName)}
                >
                  <span className={`radio-box${checked ? " on" : ""}`} aria-hidden="true" />
                  {option.businessName}
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="import-step">
          <p className="confirm-copy">Proveedor: {selectedProvider}</p>
          <button
            type="button"
            className={`dropzone${file || fileName ? " has-file" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              takeFile(event.dataTransfer.files[0] ?? null);
            }}
          >
            <FileUp />
            {file || fileName ? (
              <>
                <b>{file?.name || fileName}</b>
                <span>Hacé clic para cambiar el archivo</span>
              </>
            ) : (
              <>
                <b>Importar Excel</b>
                <span>Arrastrá un archivo .xlsx o .csv, o hacé clic para elegirlo</span>
              </>
            )}
          </button>
        </div>
      )}
    </WizardModal>
  );
}

function Podium({
  items,
  emptyLabel = "Todavía no hay productos vendidos",
}: {
  items: { name: string; provider: string; qty: number }[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="podium-empty">{emptyLabel}</p>;
  }

  const visualOrder = [items[1], items[0], items[2]].filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const ranks = items.length === 1 ? [1] : items.length === 2 ? [2, 1] : [2, 1, 3];

  return (
    <div className="podium">
      {visualOrder.map((item, index) => {
        const rank = ranks[index] ?? index + 1;
        return (
          <div className={`podium-place place-${rank}`} key={item.name}>
            <div className="podium-block">
              <span className="position">{rank}°</span>
            </div>
            <b>{item.name}</b>
            <span>{item.provider}</span>
            <strong>{item.qty} unidades</strong>
          </div>
        );
      })}
    </div>
  );
}

function SalesChart({ months }: { months: MonthSales[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [tip, setTip] = useState<{ name: string; amount: number; x: number; y: number } | null>(null);
  const { series, months: grouped } = useMemo(() => buildChartSeries(months), [months]);
  const byName = useMemo(
    () => Object.fromEntries(series.map((item) => [item.name, item])) as Record<string, ChartSeries>,
    [series],
  );
  const max = Math.max(
    ...grouped.map((month) => (selected ? (month.byProvider[selected] ?? 0) : month.total)),
    1,
  );

  const idle = grouped.every((month) => month.total === 0);

  const showTip = (event: React.MouseEvent<HTMLElement>, name: string, amount: number) => {
    const chart = event.currentTarget.closest(".sales-chart");
    if (!(chart instanceof HTMLElement)) return;
    const box = chart.getBoundingClientRect();
    const rawX = event.clientX - box.left;
    setTip({
      name,
      amount,
      x: Math.min(Math.max(rawX, 76), box.width - 76),
      y: Math.max(event.clientY - box.top, 28),
    });
  };

  const selectProvider = (event: React.MouseEvent<HTMLElement>, name: string, amount?: number) => {
    event.stopPropagation();
    setSelected(name);
    if (amount !== undefined) showTip(event, name, amount);
  };

  if (idle) {
    return (
      <div className="chart-placeholder">
        <div className="chart-ghost" aria-hidden="true" />
        <p className="chart-idle">La evolución de tus ventas aparecerá acá</p>
      </div>
    );
  }

  return (
    <div
      className="sales-chart"
      onClick={() => {
        setSelected(null);
        setTip(null);
      }}
    >
      {series.length > 0 ? (
        <div className="chart-legend">
          {series.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`chart-legend-item${selected && selected !== item.name ? " dimmed" : ""}${selected === item.name ? " active" : ""}`}
              onClick={(event) => selectProvider(event, item.name)}
            >
              <span className="chart-legend-swatch" style={{ background: item.color }} />
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="chart-scroll">
        <div className="chart-bars">
          {grouped.map((month) => {
            const value = selected ? (month.byProvider[selected] ?? 0) : month.total;
            const segments = selected
              ? [{ name: selected, amount: value }]
              : series
                  .map((item) => ({ name: item.name, amount: month.byProvider[item.name] ?? 0 }))
                  .filter((item) => item.amount > 0);

            return (
              <div className="chart-col" key={month.label}>
                <span className="chart-value">{formatCompactARS(value)}</span>
                <div
                  className="chart-bar-stack"
                  style={{
                    height: `${value > 0 ? Math.max((value / max) * 160, 4) : 4}px`,
                    background: value > 0 ? "transparent" : "#E2E8F0",
                  }}
                >
                  {segments.map((segment) => {
                    const item = byName[segment.name];
                    return (
                      <button
                        type="button"
                        key={segment.name}
                        className="chart-bar-segment"
                        style={{
                          height: `${value > 0 ? (segment.amount / value) * 100 : 0}%`,
                          background: item?.color ?? "#2563EB",
                        }}
                        aria-label={`${segment.name}: ${formatARS(segment.amount)}`}
                        onClick={(event) => selectProvider(event, segment.name, segment.amount)}
                        onMouseEnter={(event) => showTip(event, segment.name, segment.amount)}
                        onMouseMove={(event) => showTip(event, segment.name, segment.amount)}
                        onMouseLeave={() => {
                        if (window.matchMedia("(hover: hover)").matches) setTip(null);
                      }}
                      />
                    );
                  })}
                </div>
                <span className="chart-label">{month.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {tip ? (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
          <b>{tip.name}</b>
          <span>{formatARS(tip.amount)}</span>
        </div>
      ) : null}
    </div>
  );
}

function ProductLinesEditor({
  lines,
  onChange,
  searchState = "ok",
  emptyCopy = "Buscá y agregá productos a la nota",
  disabled = false,
}: {
  lines: DraftLine[];
  onChange: (lines: DraftLine[]) => void;
  searchState?: "ok" | "loading" | "error";
  emptyCopy?: string;
  disabled?: boolean;
}) {
  const [productQuery, setProductQuery] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<(typeof PRODUCT_CATALOG)[number] | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState("1");
  const productBox = useRef<HTMLDivElement>(null);
  const qtyInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!productBox.current?.contains(event.target as Node)) setProductOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  useEffect(() => {
    if (selectedProduct) qtyInput.current?.focus();
  }, [selectedProduct]);

  const filteredProducts = PRODUCT_CATALOG.filter((item) => {
    const query = productQuery.toLowerCase();
    return `${item.name} ${item.code} ${item.provider}`.toLowerCase().includes(query);
  });

  const addLine = () => {
    if (!selectedProduct) return;
    const qty = Math.max(1, Number.parseInt(qtyToAdd, 10) || 1);
    const existing = lines.find((line) => line.id === selectedProduct.id);
    onChange(
      existing
        ? lines.map((line) =>
            line.id === selectedProduct.id ? { ...line, qty: line.qty + qty } : line,
          )
        : [
            ...lines,
            {
              id: selectedProduct.id,
              name: selectedProduct.name,
              provider: selectedProduct.provider,
              qty,
            },
          ],
    );
    setSelectedProduct(null);
    setProductQuery("");
    setQtyToAdd("1");
  };

  return (
    <div className="product-add">
      <span>Productos</span>
      {selectedProduct ? (
        <div className="qty-add-row">
          <div className="selected-product">
            <b>{selectedProduct.name}</b>
            <button
              type="button"
              aria-label="Cambiar producto"
              onClick={() => {
                setSelectedProduct(null);
                setProductQuery("");
              }}
            >
              <X />
            </button>
          </div>
          <label className="qty-field">
            Cantidad
            <input
              ref={qtyInput}
              type="number"
              min={1}
              value={qtyToAdd}
              onChange={(event) => setQtyToAdd(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addLine();
                }
              }}
            />
          </label>
          <PrimaryButton onClick={addLine}>Agregar</PrimaryButton>
        </div>
      ) : (
        <div className="combo" ref={productBox}>
          <div className="search-field modal-search">
            <Search />
            <input
              value={productQuery}
              disabled={disabled}
              onChange={(event) => {
                setProductQuery(event.target.value);
                setProductOpen(true);
              }}
              onFocus={() => setProductOpen(true)}
              onClick={() => setProductOpen(true)}
              placeholder="Buscar producto"
              autoComplete="off"
            />
          </div>
          {productOpen && (
            <div className="combo-menu" role="listbox">
              {searchState === "loading" ? (
                <div className="combo-skel">
                  <Skeleton className="sk-line w-72" />
                  <Skeleton className="sk-line w-56" />
                  <Skeleton className="sk-line w-40" />
                </div>
              ) : searchState === "error" ? (
                <p className="combo-empty">No pudimos buscar productos. Intentá de nuevo.</p>
              ) : filteredProducts.length === 0 ? (
                <p className="combo-empty">No se encontraron productos</p>
              ) : (
                filteredProducts.map((item) => (
                  <button
                    type="button"
                    className="combo-item"
                    key={item.id}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedProduct(item);
                      setProductOpen(false);
                      setQtyToAdd("1");
                    }}
                  >
                    <b>{item.name}</b>
                    <span>
                      {item.code} · {item.provider}
                      {item.price === null ? " · A cotizar" : ` · ${formatARS(item.price)}`}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
      <div className="line-list">
        {lines.length === 0 ? (
          <p className="line-empty">{emptyCopy}</p>
        ) : (
          lines.map((line) => {
            const catalog = PRODUCT_CATALOG.find((item) => item.id === line.id);
            const price = catalog?.price;
            return (
            <div className="line-row" key={line.id}>
              <div className="line-copy">
                <b>{line.name}</b>
                <span>
                  {line.provider}
                  {price == null ? " · A cotizar" : ` · ${formatARS(price)}`}
                </span>
              </div>
              <div className="qty-stepper">
                <button
                  type="button"
                  aria-label="Restar"
                  disabled={disabled}
                  onClick={() =>
                    onChange(
                      lines.map((item) =>
                        item.id === line.id ? { ...item, qty: Math.max(1, item.qty - 1) } : item,
                      ),
                    )
                  }
                >
                  <Minus />
                </button>
                <input
                  className="qty-input"
                  type="number"
                  min={1}
                  disabled={disabled}
                  value={line.qty}
                  aria-label="Cantidad"
                  onChange={(event) => {
                    const qty = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
                    onChange(lines.map((item) => (item.id === line.id ? { ...item, qty } : item)));
                  }}
                />
                <button
                  type="button"
                  aria-label="Sumar"
                  disabled={disabled}
                  onClick={() =>
                    onChange(
                      lines.map((item) =>
                        item.id === line.id ? { ...item, qty: item.qty + 1 } : item,
                      ),
                    )
                  }
                >
                  <Plus />
                </button>
              </div>
              <IconButton
                className="danger"
                label="Eliminar"
                disabled={disabled}
                onClick={() => onChange(lines.filter((item) => item.id !== line.id))}
              >
                <Trash2 />
              </IconButton>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onDelete,
  onCloseOrder,
  onChangeLines,
}: {
  order: Order;
  onClose: () => void;
  onDelete: () => void;
  onCloseOrder: () => void;
  onChangeLines: (lines: Order["lines"], totalAmount: number) => void;
}) {
  const [lines, setLines] = useState(() => toDraftLines(order.lines));
  const residual = useRef(order.totalAmount - linesAmount(toDraftLines(order.lines)));

  useEffect(() => {
    const initial = toDraftLines(order.lines);
    setLines(initial);
    residual.current = order.totalAmount - linesAmount(initial);
  }, [order.id]);

  const commit = (next: DraftLine[]) => {
    setLines(next);
    onChangeLines(toOrderLines(next), Math.max(0, linesAmount(next) + residual.current));
  };

  const isClosed = order.status === "Cerrada";

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="modal-card order-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-title plain">
          <div className="order-heading">
            <h2>{order.id}</h2>
            <span className={`badge ${isClosed ? "blue" : "amber"}`}>
              {order.status}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X />
          </button>
        </div>
        <div className="order-detail">
          <div className="detail-block">
            <span>Cliente</span>
            <b>{order.client}</b>
          </div>
          <div className="detail-block">
            <span>Fecha</span>
            <b>{formatOrderDate(order.createdAt)}</b>
          </div>
          {isClosed ? (
            <div className="detail-block">
              <span>Productos</span>
              <div className="detail-lines">
                {order.lines.map((line) => (
                  <div className="detail-line" key={`${line.name}-${line.provider}`}>
                    <b>{line.name}</b>
                    <span>x{line.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ProductLinesEditor lines={lines} onChange={commit} />
          )}
          <div className="detail-total">
            <span>Total</span>
            <strong>{formatARS(order.totalAmount)}</strong>
          </div>
        </div>
        {isClosed ? null : (
          <div className="modal-actions">
            <button type="button" className="secondary-button danger" onClick={onDelete}>
              Eliminar
            </button>
            <PrimaryButton onClick={onCloseOrder}>Cerrar pedido</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function NewOrderModal({
  clients,
  onDismiss,
  onCreate,
  onNotify,
  demoState,
}: {
  clients: Contact[];
  onDismiss: () => void;
  onCreate: (draft: {
    client: string;
    lines: Order["lines"];
    totalAmount: number;
    status: Order["status"];
  }) => void;
  onNotify: (message: string) => void;
  demoState?: ModalState;
}) {
  const [clientQuery, setClientQuery] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Contact | null>(null);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<"form" | "saving" | "generating" | "error" | "success">("form");
  const [generatedCount, setGeneratedCount] = useState(1);
  const clientBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!clientBox.current?.contains(event.target as Node)) setClientOpen(false);
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  useEffect(() => {
    if (!demoState) return;
    if (demoState === "empty") {
      setSelectedClient(null);
      setClientQuery("");
      setLines([]);
      setPhase("form");
    } else if (demoState === "loading") {
      setSelectedClient(clients[0] ?? null);
      setLines(DEMO_ORDER_LINES);
      setPhase("generating");
    } else {
      setSelectedClient(clients[0] ?? null);
      setLines(DEMO_ORDER_LINES);
      setPhase(demoState === "error" ? "error" : "form");
    }
  }, [demoState, clients]);

  const filteredClients = clients.filter((client) => {
    const query = clientQuery.toLowerCase();
    return client.businessName.toLowerCase().includes(query) || client.name.toLowerCase().includes(query);
  });
  const ready = Boolean(selectedClient && lines.length > 0);
  const busy = phase === "saving" || phase === "generating";
  const searchState = demoState === "loading" ? "loading" : demoState === "error" ? "error" : "ok";

  const finish = (status: Order["status"]) => {
    if (!selectedClient || lines.length === 0) return;
    const providers = new Set(lines.map((line) => line.provider)).size;
    setGeneratedCount(Math.max(1, providers));
    onCreate({
      client: selectedClient.businessName,
      lines: toOrderLines(lines),
      totalAmount: linesAmount(lines),
      status,
    });
    setPhase("success");
  };

  const submit = (status: Order["status"]) => {
    if (!ready) {
      if (status === "Cerrada") {
        onNotify("Cargá un cliente y al menos un producto");
        return;
      }
      onDismiss();
      return;
    }
    if (demoState === "error") {
      setPhase("error");
      return;
    }
    setPhase(status === "Cerrada" ? "generating" : "saving");
    window.setTimeout(() => finish(status), 800);
  };

  if (phase === "success") {
    return (
      <div className="modal-layer">
        <div className="modal-card order-modal" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-title plain">
            <h2>Nueva nota de pedido</h2>
            <button type="button" onClick={onDismiss} aria-label="Cerrar">
              <X />
            </button>
          </div>
          <StatusPanel
            title={
              generatedCount === 1
                ? "Se generó 1 nota de pedido"
                : `Se generaron ${generatedCount} notas de pedido, una por proveedor`
            }
            copy="Ya podés compartir el PDF o cerrar esta ventana."
            action={
              <div className="modal-actions-end">
                <button type="button" className="secondary-button" onClick={() => onNotify("PDF listo para compartir")}>
                  <Share2 /> Compartir PDF
                </button>
                <PrimaryButton onClick={onDismiss}>Cerrar</PrimaryButton>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-layer" onMouseDown={busy ? undefined : onDismiss}>
      <div className="modal-card order-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-title plain">
          <h2>Nueva nota de pedido</h2>
          <button type="button" onClick={busy ? undefined : onDismiss} aria-label="Cerrar" disabled={busy}>
            <X />
          </button>
        </div>
        <div className="order-form">
          {phase === "error" ? (
            <div className="modal-alert">
              No pudimos guardar la nota. Revisá tu conexión y volvé a intentar.
            </div>
          ) : null}
          <label>
            Cliente
            <div className="combo" ref={clientBox}>
              <input
                value={clientOpen ? clientQuery : (selectedClient?.businessName ?? clientQuery)}
                onChange={(event) => {
                  setSelectedClient(null);
                  setClientQuery(event.target.value);
                  setClientOpen(true);
                }}
                onFocus={() => {
                  setClientOpen(true);
                  if (selectedClient) setClientQuery("");
                }}
                onClick={() => setClientOpen(true)}
                placeholder="Buscar cliente"
                autoComplete="off"
                disabled={busy}
              />
              {clientOpen && (
                <div className="combo-menu" role="listbox">
                  {searchState === "loading" ? (
                    <div className="combo-skel">
                      <Skeleton className="sk-line w-72" />
                      <Skeleton className="sk-line w-56" />
                    </div>
                  ) : searchState === "error" ? (
                    <p className="combo-empty">No pudimos buscar clientes. Intentá de nuevo.</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="combo-empty">No se encontraron clientes</p>
                  ) : (
                    filteredClients.map((client) => (
                      <button
                        type="button"
                        className="combo-item"
                        key={client.businessName}
                        onClick={() => {
                          setSelectedClient(client);
                          setClientQuery("");
                          setClientOpen(false);
                        }}
                      >
                        <b>{client.businessName}</b>
                        <span>{client.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </label>

          <ProductLinesEditor
            lines={lines}
            onChange={setLines}
            searchState={searchState}
            disabled={busy}
          />

          <label>
            Observación
            <textarea
              placeholder="Escribí una observación"
              value={notes}
              disabled={busy}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onDismiss} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => submit("Pendiente")}
            disabled={!ready || busy}
          >
            {phase === "saving" ? "Guardando…" : "Guardar pendiente"}
          </button>
          {phase === "error" ? (
            <PrimaryButton onClick={() => submit("Cerrada")}>Reintentar</PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => submit("Cerrada")} disabled={!ready || busy}>
              {phase === "generating" ? "Generando notas…" : "Cerrar nota de pedido"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactModal({
  kind,
  contact,
  onClose,
  onSave,
  onDelete,
  demoState,
}: {
  kind: ContactKind;
  contact: Contact | null;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onDelete?: () => void;
  demoState?: ModalState;
}) {
  const isNew = !contact;
  const filledDemo: Contact = {
    id: "",
    businessName: kind === "proveedor" ? "Cementos del Sur" : "Constructora Andina",
    name: kind === "proveedor" ? "Jorge Ramírez" : "María González",
    cuit: kind === "proveedor" ? "30-50123456-7" : "30-71234567-1",
    latLng: "-34.6037, -58.3816",
    note: "",
    phone: "+54 11 4580 2200",
    email: kind === "proveedor" ? "jorge@cementosdelsur.com" : "maria@andina.com",
  };
  const [draft, setDraft] = useState<Contact>(contact ?? emptyContact());
  const [phase, setPhase] = useState<"form" | "saving" | "error">("form");
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!demoState) {
      setDraft(contact ?? emptyContact());
      setPhase("form");
      setShowErrors(false);
      return;
    }
    if (demoState === "empty") {
      setDraft(emptyContact());
      setPhase("form");
      setShowErrors(false);
    } else if (demoState === "loading") {
      setDraft(filledDemo);
      setPhase("saving");
    } else if (demoState === "error") {
      setDraft(filledDemo);
      setPhase("error");
      setShowErrors(true);
    } else {
      setDraft(filledDemo);
      setPhase("form");
      setShowErrors(false);
    }
  }, [demoState, contact]);

  const dirty =
    isNew ||
    !contact ||
    draft.businessName !== contact.businessName ||
    draft.name !== contact.name ||
    draft.cuit !== contact.cuit ||
    draft.latLng !== contact.latLng ||
    draft.note !== contact.note ||
    draft.phone !== contact.phone ||
    draft.email !== contact.email;
  const missingName = draft.businessName.trim().length === 0;
  const missingPerson = draft.name.trim().length === 0;
  const canSave = dirty && !missingName && !missingPerson;
  const busy = phase === "saving";

  const update = (field: keyof Contact, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    if (demoState === "error") {
      setPhase("error");
      return;
    }
    setPhase("saving");
    window.setTimeout(() => {
      onSave({ ...draft, businessName: draft.businessName.trim() });
    }, 700);
  };

  return (
    <div className="modal-layer" onMouseDown={busy ? undefined : onClose}>
      <div className="modal-card contact-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-title plain">
          <h2>
            {isNew ? (kind === "proveedor" ? "Nuevo Proveedor" : "Nuevo cliente") : draft.businessName || `Editar ${kind}`}
          </h2>
          <button type="button" onClick={busy ? undefined : onClose} aria-label="Cerrar" disabled={busy}>
            <X />
          </button>
        </div>
        <div className="form-grid">
          {phase === "error" ? (
            <p className="modal-alert span-2">
              {kind === "proveedor"
                ? "No pudimos guardar el proveedor. Volvé a intentar."
                : "No pudimos guardar el cliente. Volvé a intentar."}
            </p>
          ) : null}
          <label>
            Razón social
            <input
              value={draft.businessName}
              disabled={busy}
              onChange={(event) => update("businessName", event.target.value)}
              placeholder="Ingresá la razón social"
            />
            {showErrors && missingName ? <span className="field-error">Ingresá la razón social</span> : null}
          </label>
          <label>
            Nombre y apellido
            <input
              value={draft.name}
              disabled={busy}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Ingresá el nombre"
            />
            {showErrors && missingPerson ? <span className="field-error">Ingresá el nombre y apellido</span> : null}
          </label>
          <label>
            CUIT
            <input
              value={draft.cuit}
              disabled={busy}
              onChange={(event) => update("cuit", event.target.value)}
              placeholder="00-00000000-0"
            />
          </label>
          <label>
            LatLog
            <input
              value={draft.latLng}
              disabled={busy}
              onChange={(event) => update("latLng", event.target.value)}
              placeholder="-34.6037, -58.3816"
            />
          </label>
          <label className="span-2">
            Nota
            <textarea
              value={draft.note}
              disabled={busy}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Información adicional"
            />
          </label>
          <label>
            Teléfono
            <input
              value={draft.phone}
              disabled={busy}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+54 11"
            />
          </label>
          <label>
            Mail
            <input
              type="email"
              value={draft.email}
              disabled={busy}
              onChange={(event) => update("email", event.target.value)}
              placeholder="mail@empresa.com"
            />
          </label>
        </div>
        <div className={`modal-actions${onDelete ? " has-delete" : ""}`}>
          {onDelete ? (
            <button type="button" className="secondary-button danger" onClick={onDelete}>
              Eliminar
            </button>
          ) : null}
          <div className="modal-actions-end">
            <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <PrimaryButton onClick={submit} disabled={!canSave || busy}>
              {busy ? "Guardando…" : phase === "error" ? "Reintentar" : "Guardar"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-layer nested" onMouseDown={onCancel}>
      <div className="modal-card confirm-card" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-title plain">
          <h2>{title}</h2>
          <button type="button" onClick={onCancel} aria-label="Cerrar">
            <X />
          </button>
        </div>
        <p className="confirm-copy">{message}</p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="primary-button danger-fill" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.48 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.6 5.93L0 24l6.35-1.66a11.86 11.86 0 0 0 5.69 1.45h.01c6.56 0 11.88-5.32 11.88-11.86 0-3.17-1.23-6.15-3.41-8.45ZM12.05 21.7h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.77.99 1.01-3.67-.23-.38a9.82 9.82 0 0 1-1.51-5.25c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.89 6.95c0 5.44-4.43 9.86-9.82 9.86Zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="primary-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  className,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className ? `icon-tip ${className}` : "icon-tip"}
      aria-label={label}
      data-tip={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
