"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileDown, Menu, Pencil, Phone, Plus, Search, Share2, Trash2, X } from "lucide-react";

const navItems = [
  ["Inicio", "/"],
  ["Notas de Pedido", "/notas-de-pedido"],
  ["Clientes", "/clientes"],
  ["Proveedores", "/proveedores"],
  ["Productos", "/productos"],
] as const;

const orders = [
  { id: "NP-1048", client: "Constructora Andina", provider: "Cementos del Sur", saved: "16 sep, 10:42", products: 8, total: "ARS 428.500", status: "Pendiente" },
  { id: "NP-1047", client: "Almacén El Roble", provider: "Distribuidora Norte", saved: "15 sep, 16:20", products: 12, total: "ARS 312.000", status: "Pendiente" },
  { id: "NP-1046", client: "Obras del Sur", provider: "Materiales Roca", saved: "14 sep, 09:12", products: 5, total: "ARS 196.800", status: "Pendiente" },
  { id: "NP-1045", client: "Ferretería Central", provider: "Cementos del Sur", saved: "12 sep, 13:40", products: 17, total: "ARS 622.400", status: "Cerrada" },
];
const people = {
  Clientes: ["Constructora Andina", "Almacén El Roble", "Obras del Sur", "Ferretería Central"],
  Proveedores: ["Cementos del Sur", "Distribuidora Norte", "Materiales Roca", "Logística del Plata"],
};
const products = ["Cemento especial 25 kg", "Plancha OSB 11 mm", "Tubo PVC 110 mm", "Malla Acma C-92"];

type Section = "Inicio" | "Notas de Pedido" | "Clientes" | "Proveedores" | "Productos";

export default function HomePage() {
  const [section, setSection] = useState<Section>("Inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Pendientes");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const go = (next: Section) => { setSection(next); setMobileOpen(false); window.history.pushState({}, "", next === "Inicio" ? "/" : `/${next.toLowerCase().replaceAll(" ", "-")}`); };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };
  const filteredOrders = useMemo(() => orders.filter((item) => `${item.id} ${item.client} ${item.provider}`.toLowerCase().includes(query.toLowerCase()) && (section !== "Notas de Pedido" || tab === "Todas" || item.status === tab.slice(0, -1))), [query, section, tab]);

  return <div className="cauce-app">
    <header className="site-header">
      <div className="header-inner">
        <button className="logo-button" onClick={() => go("Inicio")} aria-label="Ir a Inicio"><img src="/logo-cauce.png" alt="CAUCE" /></button>
        <nav className="desktop-nav" aria-label="Navegación principal">{navItems.map(([label]) => <button key={label} className={section === label ? "active" : ""} onClick={() => go(label as Section)}>{label}</button>)}</nav>
        <button className="menu-button" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu /></button>
      </div>
      {mobileOpen && <div className="mobile-menu-panel"><div className="mobile-menu-top"><span>Navegación</span><button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X /></button></div>{navItems.map(([label]) => <button key={label} className={section === label ? "active" : ""} onClick={() => go(label as Section)}>{label}</button>)}</div>}
    </header>

    <main className="content-wrap">{section === "Inicio" && <HomeView onNew={() => setModal("Nueva nota de pedido")} expanded={expanded} setExpanded={setExpanded} onAction={notify} />}{section === "Notas de Pedido" && <OrdersView tab={tab} setTab={setTab} query={query} setQuery={setQuery} rows={filteredOrders} onNew={() => setModal("Nueva nota de pedido")} onAction={notify} />}{(section === "Clientes" || section === "Proveedores") && <PeopleView kind={section} query={query} setQuery={setQuery} onNew={() => setModal(`Nuevo ${section.slice(0, -1).toLowerCase()}`)} onAction={notify} />}{section === "Productos" && <ProductsView query={query} setQuery={setQuery} onAction={notify} />}</main>
    {modal && <Modal title={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); notify("Cambios guardados correctamente"); }} />}
    {notice && <div className="toast" role="status">{notice}</div>}
  </div>;
}

function PageIntro({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) { return <div className="page-intro"><div><span className="eyebrow">{eyebrow ?? "CAUCE"}</span><h1>{title}</h1></div>{action}</div>; }
function HomeView({ onNew, expanded, setExpanded, onAction }: { onNew: () => void; expanded: string | null; setExpanded: (value: string | null) => void; onAction: (text: string) => void }) { return <><PageIntro title="Inicio" action={<PrimaryButton onClick={onNew}><Plus /> Nueva nota de pedido</PrimaryButton>} /><section className="stat-card"><span className="eyebrow">Notas pendientes</span><strong>3</strong><span className="muted">Requieren tu atención</span></section><section className="surface"><div className="section-heading"><div><span className="eyebrow">Notas de pedido</span><h2>Pendientes</h2></div><button className="link-button" onClick={() => onAction("Vista de notas de pedido")}>Ver todas</button></div><OrderRows compact onAction={onAction} /></section><section className="surface sales-card"><span className="eyebrow">Ventas del mes</span><h2>Ventas de septiembre</h2><strong>ARS 1.248.500</strong><span className="muted">Actualizado al 16 de septiembre</span></section><Collapsible title="Productos más vendidos" open={expanded === "products"} onClick={() => setExpanded(expanded === "products" ? null : "products")}><Podium /></Collapsible><Collapsible title="Ventas de los últimos 12 meses" open={expanded === "sales"} onClick={() => setExpanded(expanded === "sales" ? null : "sales")}><SalesChart /></Collapsible></>; }
function OrdersView({ tab, setTab, query, setQuery, rows, onNew, onAction }: { tab: string; setTab: (value: string) => void; query: string; setQuery: (value: string) => void; rows: typeof orders; onNew: () => void; onAction: (text: string) => void }) { return <><PageIntro title="Notas de Pedido" action={<PrimaryButton onClick={onNew}><Plus /> Nueva nota</PrimaryButton>} /><div className="toolbar"><div className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar notas de pedido" /></div><div className="tabs">{["Pendientes", "Cerradas", "Todas"].map((item) => <button className={tab === item ? "selected" : ""} onClick={() => setTab(item)} key={item}>{item}<span>{item === "Pendientes" ? 3 : item === "Cerradas" ? 1 : 4}</span></button>)}</div></div><section className="surface"><OrderRows rows={rows} onAction={onAction} /><div className="pagination"><button>Anterior</button><span>1</span><button>Siguiente</button></div></section></>; }
function OrderRows({ compact = false, rows = orders.slice(0, 3), onAction }: { compact?: boolean; rows?: typeof orders; onAction: (text: string) => void }) { return <div className="order-list">{rows.map((item) => <div className={`order-row ${compact ? "compact" : ""}`} key={item.id}><div className="order-main"><strong>{item.id}</strong><div><b>{item.client}</b><span>{item.provider}</span></div></div><div className="order-meta"><span>{item.saved}</span><span>{item.products} productos</span><strong>{item.total}</strong></div><span className={`badge ${item.status === "Cerrada" ? "blue" : "amber"}`}>{item.status}</span><div className="row-actions"><button aria-label="Editar" onClick={() => onAction("Edición habilitada")}><Pencil /></button><button aria-label="Eliminar" onClick={() => onAction("Nota eliminada")}><Trash2 /></button>{!compact && <button aria-label="Compartir PDF" onClick={() => onAction("PDF listo para compartir")}><Share2 /></button>}</div></div>)}</div>; }
function PeopleView({ kind, query, setQuery, onNew, onAction }: { kind: "Clientes" | "Proveedores"; query: string; setQuery: (value: string) => void; onNew: () => void; onAction: (text: string) => void }) { const list = people[kind].filter((name) => name.toLowerCase().includes(query.toLowerCase())); return <><PageIntro title={kind} action={<PrimaryButton onClick={onNew}><Plus /> Nuevo {kind.slice(0, -1).toLowerCase()}</PrimaryButton>} /><div className="toolbar"><div className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Buscar ${kind.toLowerCase()}`} /></div><button className="secondary-button">Ordenar A–Z <ChevronDown /></button></div><section className="surface people-list"><div className="table-head"><span>Razón social</span><span>Nombre y apellido</span><span>Teléfono</span><span>Acciones</span></div>{list.map((name, index) => <div className="person-row" key={name}><b>{name}</b><span>María González</span><span>+54 11 4580 220{index}</span><div><button aria-label="Llamar" onClick={() => onAction("Llamando al contacto")}><Phone /></button><button aria-label="WhatsApp" onClick={() => onAction("WhatsApp abierto")}><Share2 /></button><button aria-label="Editar" onClick={() => onAction("Edición habilitada")}><Pencil /></button></div></div>)}</section></>; }
function ProductsView({ query, setQuery, onAction }: { query: string; setQuery: (value: string) => void; onAction: (text: string) => void }) { return <><PageIntro title="Productos" action={<PrimaryButton onClick={() => onAction("Importación iniciada")}><FileDown /> Importar lista</PrimaryButton>} /><div className="toolbar"><div className="search-field"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar productos" /></div><button className="secondary-button">Proveedores <ChevronDown /></button></div><section className="surface products-list"><div className="table-head"><span>Producto</span><span>Código</span><span>Proveedor</span><span>Precio sin IVA</span><span>Acciones</span></div>{products.filter((p) => p.toLowerCase().includes(query.toLowerCase())).map((product, index) => <div className="product-row" key={product}><div><div className="product-image">{index + 1}</div><b>{product}</b></div><span>PR-{100 + index}</span><span>{index % 2 ? "Materiales Roca" : "Cementos del Sur"}</span><span>{index === 2 ? <span className="badge gray">A cotizar</span> : `ARS ${(12500 + index * 3100).toLocaleString("es-AR")}`}</span><button aria-label="Editar" onClick={() => onAction("Edición habilitada")}><Pencil /></button></div>)}</section></>; }
function Collapsible({ title, open, onClick, children }: { title: string; open: boolean; onClick: () => void; children: React.ReactNode }) { return <section className="surface collapsible"><button className="collapse-trigger" onClick={onClick}><h2>{title}</h2><ChevronDown className={open ? "rotated" : ""} /></button>{open && <div className="collapse-content">{children}</div>}</section>; }
function Podium() { return <div className="podium">{[products[0], products[1], products[2]].map((product, index) => <div key={product}><span className="position">{index + 1}</span><b>{product}</b><span>{index % 2 ? "Distribuidora Norte" : "Cementos del Sur"}</span><strong>{132 - index * 24} unidades</strong></div>)}</div>; }
function SalesChart() { return <div className="sales-chart"><div className="chart-bars">{[58, 71, 48, 82, 63, 76, 52, 88, 67, 79, 61, 94].map((height, index) => <div key={index} style={{ height: `${height}%` }}><span>{["oct", "nov", "dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep"][index]}</span></div>)}</div><strong>ARS 12.408.000</strong></div>; }
function Modal({ title, onClose, onSave }: { title: string; onClose: () => void; onSave: () => void }) { return <div className="modal-layer" onMouseDown={onClose}><div className="modal-card" onMouseDown={(event) => event.stopPropagation()}><div className="modal-title"><div><span className="eyebrow">CAUCE</span><h2>{title}</h2></div><button onClick={onClose} aria-label="Cerrar"><X /></button></div><div className="form-grid"><label>Razón social<input placeholder="Ingresá la razón social" /></label><label>Nombre y apellido<input placeholder="Ingresá el nombre" /></label><label>Teléfono<input placeholder="+54 11" /></label><label>Notas<textarea placeholder="Información adicional" /></label></div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancelar</button><PrimaryButton onClick={onSave}>Guardar</PrimaryButton></div></div></div>; }
function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button className="primary-button" onClick={onClick}>{children}</button>; }
