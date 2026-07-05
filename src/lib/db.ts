import Dexie, { type EntityTable } from "dexie";

export interface OfflineProducto {
  id: string;
  empresaId: string;
  sku: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string | null;
  categoria: string;
  precio: number | null;
  imagenUrl: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _synced: boolean;
}

export interface OfflineTallaje {
  id: string;
  productoId: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
  precioEfectivo: number;
  precioTransferencia: number;
  _synced: boolean;
}

export interface OfflineMovimiento {
  id: string;
  empresaId: string;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  usuarioId: string;
  tallajeId: string;
  createdAt: string;
  _synced: boolean;
}

export interface SyncQueueEntry {
  id?: number;
  entity: "producto" | "tallaje" | "movimiento";
  entityId: string;
  action: "create" | "update" | "delete";
  payload: unknown;
  timestamp: string;
  retryCount: number;
  status: "pending" | "processing" | "failed";
}

export interface OfflineAuthSession {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  empresaId: string;
  empresaNombre: string;
  puedeEditarStock: boolean;
  createdAt: string;
}

class StockCalzadoDB extends Dexie {
  productos!: EntityTable<OfflineProducto, "id">;
  tallas!: EntityTable<OfflineTallaje, "id">;
  movimientos!: EntityTable<OfflineMovimiento, "id">;
  syncQueue!: EntityTable<SyncQueueEntry, "id">;
  authSession!: EntityTable<OfflineAuthSession, "id">;

  constructor() {
    super("StockCalzadoDB");
    this.version(2).stores({
      productos: "id, empresaId, sku, _synced",
      tallas: "id, productoId, _synced",
      movimientos: "id, empresaId, tallajeId, _synced",
      syncQueue: "++id, entity, entityId, status, timestamp",
      authSession: "id, email",
    });
  }
}

export const db = new StockCalzadoDB();
