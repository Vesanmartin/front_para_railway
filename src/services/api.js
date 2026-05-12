// src/services/api.js
const BFF_URL     = 'http://localhost:3005';
const GATEWAY_URL = 'http://localhost:3000';

// Autenticación — va directo al gateway
export const login = async (email, password) => {
  const respuesta = await fetch(`${GATEWAY_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!respuesta.ok) throw new Error('Credenciales incorrectas');
  return respuesta.json();
};

// Obtener KPIs desde el BFF
export const obtenerKPIs = async () => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BFF_URL}/bff/kpis/tipos`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!respuesta.ok) throw new Error('Error obteniendo KPIs');
  return respuesta.json();
};

// Obtener dashboard desde el BFF
export const obtenerDashboard = async () => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BFF_URL}/bff/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!respuesta.ok) throw new Error('Error obteniendo dashboard');
  return respuesta.json();
};

// Obtener proyectos desde el BFF
export const obtenerProyectos = async () => {
  const token = localStorage.getItem('token');
  const respuesta = await fetch(`${BFF_URL}/bff/gestion`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!respuesta.ok) throw new Error('Error obteniendo proyectos');
  return respuesta.json();
};