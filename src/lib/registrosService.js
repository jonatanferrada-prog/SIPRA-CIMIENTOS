import { supabase } from "./supabaseClient";

export async function crearRegistro({ areaId, tipo, titulo, descripcion, fechaHora, estado }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const payload = {
    area_id: areaId,
    created_by: userId,
    tipo: tipo || "operativo",
    titulo,
    descripcion: descripcion || null,
    fecha_hora: fechaHora || new Date().toISOString(),
    estado: estado || "open",
  };

  const { data, error } = await supabase
    .from("registros")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listarRegistros({ areaId, estado, tipoContiene, desde, hasta }) {
  let q = supabase
    .from("registros")
    .select("id, tipo, titulo, descripcion, fecha_hora, estado, created_at, created_by")
    .eq("area_id", areaId)
    .order("fecha_hora", { ascending: false });

  if (estado && estado !== "todos") q = q.eq("estado", estado);
  if (tipoContiene) q = q.ilike("tipo", `%${tipoContiene}%`);
  if (desde) q = q.gte("fecha_hora", desde);
  if (hasta) q = q.lte("fecha_hora", hasta);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}