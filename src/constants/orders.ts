import type { Order } from "@/lib/sales";

function atMonthsAgo(monthsAgo: number, day: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo, Math.min(day, 28));
  date.setHours(hour, minute, 0, 0);
  if (monthsAgo === 0 && date > new Date()) {
    date.setDate(new Date().getDate());
    date.setHours(Math.min(hour, 12), minute, 0, 0);
  }
  return date.toISOString();
}

export const ORDERS: Order[] = [
  {
    id: "NP-1048",
    client: "Constructora Andina",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(0, 16, 10, 42),
    closedAt: null,
    status: "Pendiente",
    totalAmount: 428500,
    lines: [
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 5 },
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 3 },
    ],
  },
  {
    id: "NP-1047",
    client: "Almacén El Roble",
    provider: "Distribuidora Norte",
    createdAt: atMonthsAgo(0, 15, 16, 20),
    closedAt: null,
    status: "Pendiente",
    totalAmount: 312000,
    lines: [{ name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 12 }],
  },
  {
    id: "NP-1046",
    client: "Obras del Sur",
    provider: "Materiales Roca",
    createdAt: atMonthsAgo(0, 14, 9, 12),
    closedAt: null,
    status: "Pendiente",
    totalAmount: 196800,
    lines: [{ name: "Malla Acma C-92", provider: "Materiales Roca", qty: 5 }],
  },
  {
    id: "NP-1045",
    client: "Ferretería Central",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(0, 12, 13, 40),
    closedAt: atMonthsAgo(0, 12, 13, 40),
    status: "Cerrada",
    totalAmount: 622400,
    lines: [
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 10 },
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 7 },
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 4 },
    ],
  },
  {
    id: "NP-1044",
    client: "Boutique La Esquina",
    provider: "Distribuidora Norte",
    createdAt: atMonthsAgo(0, 8, 11, 20),
    closedAt: atMonthsAgo(0, 8, 11, 20),
    status: "Cerrada",
    totalAmount: 386200,
    lines: [
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 18 },
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 3 },
    ],
  },
  {
    id: "NP-1039",
    client: "Obra Nueva",
    provider: "Materiales Roca",
    createdAt: atMonthsAgo(1, 22, 16, 10),
    closedAt: atMonthsAgo(1, 22, 16, 10),
    status: "Cerrada",
    totalAmount: 814000,
    lines: [
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 14 },
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 9 },
      { name: "Flete", provider: "Logística del Plata", qty: 1 },
    ],
  },
  {
    id: "NP-1032",
    client: "Casa Roca",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(2, 18, 9, 40),
    closedAt: atMonthsAgo(2, 18, 9, 40),
    status: "Cerrada",
    totalAmount: 540300,
    lines: [
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 11 },
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 6 },
    ],
  },
  {
    id: "NP-1026",
    client: "Ferretería Central",
    provider: "Distribuidora Norte",
    createdAt: atMonthsAgo(3, 9, 15, 5),
    closedAt: atMonthsAgo(3, 9, 15, 5),
    status: "Cerrada",
    totalAmount: 471800,
    lines: [
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 16 },
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 5 },
      { name: "Perfil U", provider: "Aceros del Litoral", qty: 1 },
    ],
  },
  {
    id: "NP-1018",
    client: "Constructora Andina",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(4, 27, 12, 18),
    closedAt: atMonthsAgo(4, 27, 12, 18),
    status: "Cerrada",
    totalAmount: 698500,
    lines: [
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 21 },
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 8 },
    ],
  },
  {
    id: "NP-1011",
    client: "Almacén El Roble",
    provider: "Materiales Roca",
    createdAt: atMonthsAgo(5, 14, 10, 0),
    closedAt: atMonthsAgo(5, 14, 10, 0),
    status: "Cerrada",
    totalAmount: 352000,
    lines: [
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 8 },
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 4 },
      { name: "Látex interior", provider: "Pinturas Atlas", qty: 1 },
    ],
  },
  {
    id: "NP-1004",
    client: "Obras del Sur",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(6, 20, 17, 30),
    closedAt: atMonthsAgo(6, 20, 17, 30),
    status: "Cerrada",
    totalAmount: 419700,
    lines: [
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 9 },
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 5 },
    ],
  },
  {
    id: "NP-0996",
    client: "Ferretería Central",
    provider: "Distribuidora Norte",
    createdAt: atMonthsAgo(7, 11, 8, 45),
    closedAt: atMonthsAgo(7, 11, 8, 45),
    status: "Cerrada",
    totalAmount: 287400,
    lines: [
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 10 },
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 4 },
    ],
  },
  {
    id: "NP-0988",
    client: "Constructora Andina",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(8, 24, 13, 12),
    closedAt: atMonthsAgo(8, 24, 13, 12),
    status: "Cerrada",
    totalAmount: 763200,
    lines: [
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 19 },
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 6 },
      { name: "Vidrio 4 mm", provider: "Vidrios del Este", qty: 1 },
    ],
  },
  {
    id: "NP-0975",
    client: "Casa Roca",
    provider: "Materiales Roca",
    createdAt: atMonthsAgo(9, 16, 11, 8),
    closedAt: atMonthsAgo(9, 16, 11, 8),
    status: "Cerrada",
    totalAmount: 512900,
    lines: [
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 12 },
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 5 },
    ],
  },
  {
    id: "NP-0962",
    client: "Obra Nueva",
    provider: "Cementos del Sur",
    createdAt: atMonthsAgo(10, 7, 9, 22),
    closedAt: atMonthsAgo(10, 7, 9, 22),
    status: "Cerrada",
    totalAmount: 448600,
    lines: [
      { name: "Plancha OSB 11 mm", provider: "Cementos del Sur", qty: 8 },
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 4 },
    ],
  },
  {
    id: "NP-0950",
    client: "Almacén El Roble",
    provider: "Distribuidora Norte",
    createdAt: atMonthsAgo(11, 19, 16, 40),
    closedAt: atMonthsAgo(11, 19, 16, 40),
    status: "Cerrada",
    totalAmount: 331000,
    lines: [
      { name: "Tubo PVC 110 mm", provider: "Distribuidora Norte", qty: 7 },
      { name: "Cemento especial 25 kg", provider: "Cementos del Sur", qty: 3 },
      { name: "Malla Acma C-92", provider: "Materiales Roca", qty: 2 },
      { name: "Taladro 13 mm", provider: "Herramientas Sur", qty: 1 },
    ],
  },
];
