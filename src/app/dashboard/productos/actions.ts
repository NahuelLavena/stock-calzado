"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual } from "@/lib/session";
import { crearProductoSchema, actualizarProductoSchema } from "@/lib/validations/producto";
import { crearTallajeSchema, actualizarTallajeSchema } from "@/lib/validations/tallaje";
import { arrayToCSV } from "@/lib/csv";

type ProductState = { error: string } | { success: true } | null;

export async function crearProducto(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden crear productos" };

  const parsed = crearProductoSchema.safeParse({
    sku: formData.get("sku"),
    nombre: formData.get("nombre"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    imagenUrl: formData.get("imagenUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.producto.findFirst({
    where: { sku: parsed.data.sku, empresaId: usuario.empresaId },
  });
  if (existing) {
    return { error: "Ya existe un producto con ese SKU en tu empresa" };
  }

  await prisma.producto.create({
    data: {
      ...parsed.data,
      descripcion: parsed.data.descripcion || null,
      imagenUrl: parsed.data.imagenUrl || null,
      empresaId: usuario.empresaId,
    },
  });

  redirect("/dashboard/productos");
}

export async function actualizarProducto(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden editar productos" };

  const parsed = actualizarProductoSchema.safeParse({
    id: formData.get("id"),
    sku: formData.get("sku"),
    nombre: formData.get("nombre"),
    marca: formData.get("marca"),
    modelo: formData.get("modelo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    precio: formData.get("precio"),
    imagenUrl: formData.get("imagenUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const producto = await prisma.producto.findFirst({
    where: { id: parsed.data.id, empresaId: usuario.empresaId },
  });

  if (!producto) {
    return { error: "Producto no encontrado" };
  }

  await prisma.producto.update({
    where: { id: parsed.data.id },
    data: {
      sku: parsed.data.sku,
      nombre: parsed.data.nombre,
      marca: parsed.data.marca,
      modelo: parsed.data.modelo,
      descripcion: parsed.data.descripcion || null,
      categoria: parsed.data.categoria,
      precio: parsed.data.precio,
      imagenUrl: parsed.data.imagenUrl || null,
    },
  });

  redirect(`/dashboard/productos/${parsed.data.id}`);
}

export async function toggleActivoProducto(
  id: string
): Promise<{ error?: string }> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden activar/desactivar productos" };

  const producto = await prisma.producto.findFirst({
    where: { id, empresaId: usuario.empresaId },
  });

  if (!producto) return { error: "Producto no encontrado" };

  await prisma.producto.update({
    where: { id },
    data: { activo: !producto.activo },
  });

  return {};
}

export async function crearTallaje(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden crear talles" };

  const parsed = crearTallajeSchema.safeParse({
    productoId: formData.get("productoId"),
    talla: formData.get("talla"),
    color: formData.get("color"),
    stock: formData.get("stock"),
    stockMinimo: formData.get("stockMinimo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const producto = await prisma.producto.findFirst({
    where: { id: parsed.data.productoId, empresaId: usuario.empresaId },
  });

  if (!producto) return { error: "Producto no encontrado" };

  const existing = await prisma.tallaje.findUnique({
    where: { productoId_talla_color: { productoId: parsed.data.productoId, talla: parsed.data.talla, color: parsed.data.color } },
  });

  if (existing) {
    return { error: "Ya existe ese talle/color para este producto" };
  }

  await prisma.tallaje.create({
    data: {
      productoId: parsed.data.productoId,
      talla: parsed.data.talla,
      color: parsed.data.color,
      stock: parsed.data.stock,
      stockMinimo: parsed.data.stockMinimo,
    },
  });

  return null;
}

export async function actualizarTallaje(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden editar talles" };

  const parsed = actualizarTallajeSchema.safeParse({
    id: formData.get("id"),
    stock: formData.get("stock"),
    stockMinimo: formData.get("stockMinimo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const tallaje = await prisma.tallaje.findFirst({
    where: {
      id: parsed.data.id,
      producto: { empresaId: usuario.empresaId },
    },
  });

  if (!tallaje) return { error: "Talle no encontrado" };

  await prisma.tallaje.update({
    where: { id: parsed.data.id },
    data: {
      stock: parsed.data.stock,
      stockMinimo: parsed.data.stockMinimo,
    },
  });

  return null;
}

export async function eliminarTallaje(
  id: string
): Promise<{ error?: string }> {
  const usuario = await getUsuarioActual();
  if (!usuario) return { error: "No autorizado" };
  if (usuario.rol !== "ADMIN") return { error: "Solo administradores pueden eliminar talles" };

  const tallaje = await prisma.tallaje.findFirst({
    where: {
      id,
      producto: { empresaId: usuario.empresaId },
    },
  });

  if (!tallaje) return { error: "Talle no encontrado" };

  await prisma.tallaje.delete({ where: { id } });

  return {};
}

export async function exportProductosCSV(filters: {
  search?: string;
  categoria?: string;
  estado?: string;
  marca?: string;
}): Promise<string> {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new Error("No autorizado");

  const where: Record<string, unknown> = {
    empresaId: usuario.empresaId,
  };

  if (filters.search) {
    where.OR = [
      { nombre: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
      { marca: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.categoria) where.categoria = filters.categoria;
  if (filters.marca) where.marca = filters.marca;
  if (filters.estado === "activo") where.activo = true;
  else if (filters.estado === "inactivo") where.activo = false;

  const productos = await prisma.producto.findMany({
    where,
    include: { tallas: { select: { stock: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = productos.map((p) => ({
    SKU: p.sku,
    Nombre: p.nombre,
    Marca: p.marca,
    Modelo: p.modelo,
    Categoría: p.categoria,
    Precio: Number(p.precio),
    "Stock Total": p.tallas.reduce((acc, t) => acc + t.stock, 0),
    Estado: p.activo ? "Activo" : "Inactivo",
  }));

  const csv = arrayToCSV(data, [
    { key: "SKU", header: "SKU" },
    { key: "Nombre", header: "Nombre" },
    { key: "Marca", header: "Marca" },
    { key: "Modelo", header: "Modelo" },
    { key: "Categoría", header: "Categoría" },
    { key: "Precio", header: "Precio" },
    { key: "Stock Total", header: "Stock Total" },
    { key: "Estado", header: "Estado" },
  ]);

  return Buffer.from(csv).toString("base64");
}

export async function exportStockProductoCSV(productoId: string): Promise<string> {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new Error("No autorizado");

  const producto = await prisma.producto.findFirst({
    where: { id: productoId, empresaId: usuario.empresaId },
    include: { tallas: { orderBy: { talla: "asc" } } },
  });

  if (!producto) throw new Error("Producto no encontrado");

  const data = producto.tallas.map((t) => ({
    Producto: producto.nombre,
    SKU: producto.sku,
    Talla: t.talla,
    Color: t.color,
    Stock: t.stock,
    "Stock Mínimo": t.stockMinimo,
    Estado: t.stock <= t.stockMinimo ? "Bajo" : "Normal",
  }));

  const csv = arrayToCSV(data, [
    { key: "Producto", header: "Producto" },
    { key: "SKU", header: "SKU" },
    { key: "Talla", header: "Talla" },
    { key: "Color", header: "Color" },
    { key: "Stock", header: "Stock" },
    { key: "Stock Mínimo", header: "Stock Mínimo" },
    { key: "Estado", header: "Estado" },
  ]);

  return Buffer.from(csv).toString("base64");
}
